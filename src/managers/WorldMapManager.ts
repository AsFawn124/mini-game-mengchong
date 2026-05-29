/**
 * WorldMapManager - 世界地图探索系统
 * 支持区域解锁、野外探险、遭遇事件、资源采集
 */

import { PetEntity, PetRarity } from '../entities/PetEntity';
import { GameConfig } from '../GameConfig';

// 区域定义
export interface WorldRegion {
    id: string;
    name: string;
    description: string;
    elementType: string;          // 区域元素主题
    difficulty: number;           // 1-10
    requiredLevel: number;
    unlockCost: number;           // 解锁金币
    unlocked: boolean;
    explored: number;             // 探索度 0-100%
    nodes: WorldNode[];           // 区域内的节点
    backgroundUrl: string;
}

// 探索节点
export interface WorldNode {
    id: string;
    type: NodeType;
    name: string;
    description: string;
    x: number; y: number;          // 地图坐标
    difficulty: number;
    completed: boolean;
    locked: boolean;
    rewards: WorldReward[];
    encounter: WorldEncounter | null;
    connections: string[];         // 连接的节点ID
}

export enum NodeType {
    BATTLE = 'battle',             // 战斗节点
    BOSS = 'boss',                 // Boss节点
    TREASURE = 'treasure',         // 宝箱节点
    REST = 'rest',                 // 休息节点(回复HP)
    SHOP = 'shop',                 // 商店节点
    EVENT = 'event',               // 随机事件
    PUZZLE = 'puzzle',             // 解谜节点
    ELITE = 'elite',               // 精英怪
    PORTAL = 'portal'              // 传送门(进入隐藏区域)
}

// 遭遇事件
export interface WorldEncounter {
    title: string;
    description: string;
    choices: EncounterChoice[];
}

export interface EncounterChoice {
    text: string;
    successRate: number;           // 成功率
    successRewards: WorldReward[];
    failPenalty: string;
    requirements?: {              // 要求
        elementType?: string;
        minLevel?: number;
        petCount?: number;
    };
}

// 世界奖励
export interface WorldReward {
    type: 'gold' | 'gems' | 'exp' | 'item' | 'pet' | 'pet_fragment';
    amount: number;
    id?: string;
    name?: string;
    rarity?: PetRarity;
}

// 探索队伍
export interface ExplorationTeam {
    pets: PetEntity[];
    stamina: number;
    maxStamina: number;
    currentRegion: string;
    currentNodeId: string;
}

// 探索历史
export interface ExplorationRecord {
    date: string;
    regionName: string;
    nodesCleared: number;
    battlesWon: number;
    rewards: WorldReward[];
    rareFinds: number;
    runSummary: string;
}

export class WorldMapManager {
    private static instance: WorldMapManager;

    private regions: WorldRegion[] = [];
    private explorationTeam: ExplorationTeam | null = null;
    private explorationHistory: ExplorationRecord[] = [];
    private totalExplored: number = 0;
    private rareFinds: number = 0;
    private staminaRegenInterval: number | null = null;

    // 探索队伍状态
    private currentNode: WorldNode | null = null;
    private consecutiveWins: number = 0;
    private nodeCompletionsToday: number = 0;
    private readonly DAILY_NODE_LIMIT = 20;

    private constructor() {
        this.initRegions();
        this.loadLocalData();
        this.startStaminaRegen();
    }

    public static getInstance(): WorldMapManager {
        if (!WorldMapManager.instance) {
            WorldMapManager.instance = new WorldMapManager();
        }
        return WorldMapManager.instance;
    }

    // ==================== 区域初始化 ====================

    private initRegions(): void {
        this.regions = [
            {
                id: 'garden', name: '萌宠花园', description: '新手训练师的起点，充满和平的萌宠乐园',
                elementType: 'grass', difficulty: 1, requiredLevel: 1, unlockCost: 0,
                unlocked: true, explored: 0, backgroundUrl: 'garden',
                nodes: this.generateRegionNodes('garden', 8, 1)
            },
            {
                id: 'volcano', name: '烈焰火山', description: '灼热的火山地带，火系萌宠的栖息地',
                elementType: 'fire', difficulty: 3, requiredLevel: 10, unlockCost: 2000,
                unlocked: false, explored: 0, backgroundUrl: 'volcano',
                nodes: this.generateRegionNodes('volcano', 10, 3)
            },
            {
                id: 'ocean', name: '深海遗迹', description: '水下古城，水系萌宠的神秘家园',
                elementType: 'water', difficulty: 4, requiredLevel: 15, unlockCost: 5000,
                unlocked: false, explored: 0, backgroundUrl: 'ocean',
                nodes: this.generateRegionNodes('ocean', 10, 4)
            },
            {
                id: 'forest', name: '翡翠密林', description: '古老森林，草系萌宠的绿色王国',
                elementType: 'grass', difficulty: 5, requiredLevel: 20, unlockCost: 8000,
                unlocked: false, explored: 0, backgroundUrl: 'forest',
                nodes: this.generateRegionNodes('forest', 12, 5)
            },
            {
                id: 'temple', name: '星空神殿', description: '悬浮在空中的光系圣地',
                elementType: 'light', difficulty: 7, requiredLevel: 30, unlockCost: 20000,
                unlocked: false, explored: 0, backgroundUrl: 'temple',
                nodes: this.generateRegionNodes('temple', 14, 7)
            },
            {
                id: 'abyss', name: '暗影深渊', description: '地下深处的暗系领域，隐藏着最强大的存在',
                elementType: 'dark', difficulty: 9, requiredLevel: 40, unlockCost: 50000,
                unlocked: false, explored: 0, backgroundUrl: 'abyss',
                nodes: this.generateRegionNodes('abyss', 16, 9)
            }
        ];
    }

    private generateRegionNodes(regionId: string, count: number, difficulty: number): WorldNode[] {
        const nodes: WorldNode[] = [];
        const nodeTypes = [
            { type: NodeType.BATTLE, weight: 30 },
            { type: NodeType.TREASURE, weight: 15 },
            { type: NodeType.REST, weight: 10 },
            { type: NodeType.EVENT, weight: 20 },
            { type: NodeType.ELITE, weight: 10 },
            { type: NodeType.SHOP, weight: 8 },
            { type: NodeType.PUZZLE, weight: 5 },
            { type: NodeType.PORTAL, weight: 2 }
        ];

        // Boss节点(最后一个)
        const bossNode: WorldNode = {
            id: `${regionId}_boss`,
            type: NodeType.BOSS,
            name: this.getBossName(regionId),
            description: `击败${this.getBossName(regionId)}来征服这个区域!`,
            x: 50, y: 90,
            difficulty: difficulty + 2,
            completed: false, locked: true,
            rewards: [
                { type: 'gold', amount: 1000 * difficulty },
                { type: 'gems', amount: 10 * difficulty },
                { type: 'pet_fragment', amount: 5, rarity: difficulty >= 5 ? 'SSR' : 'SR' }
            ],
            encounter: {
                title: `Boss战: ${this.getBossName(regionId)}`,
                description: `区域统治者出现了!`,
                choices: [
                    { text: '挑战Boss!', successRate: 60, successRewards: [{ type: 'gold', amount: 1000 * difficulty }], failPenalty: '队伍HP-50%' },
                    { text: '使用道具削弱Boss(-20%HP)', successRate: 85, successRewards: [{ type: 'gold', amount: 1000 * difficulty }], failPenalty: '队伍HP-30%' }
                ]
            },
            connections: []
        };

        // 生成普通节点
        for (let i = 0; i < count - 1; i++) {
            const roll = Math.random() * 100;
            let cumulative = 0;
            let selectedType = nodeTypes[0];

            for (const nt of nodeTypes) {
                cumulative += nt.weight;
                if (roll < cumulative) { selectedType = nt; break; }
            }

            const node: WorldNode = {
                id: `${regionId}_node_${i}`,
                type: selectedType.type,
                name: this.generateNodeName(selectedType.type, difficulty),
                description: this.generateNodeDescription(selectedType.type),
                x: Math.random() * 80 + 10,
                y: Math.random() * 70 + 5,
                difficulty,
                completed: false,
                locked: i > 0, // 第一个解锁
                rewards: this.generateNodeRewards(selectedType.type, difficulty),
                encounter: selectedType.type === NodeType.EVENT ? this.generateEncounter(regionId) : null,
                connections: i > 0 ? [`${regionId}_node_${i - 1}`] : []
            };

            nodes.push(node);
        }

        // 连接Boss
        if (nodes.length > 0) {
            nodes[nodes.length - 1].connections.push(`${regionId}_boss`);
            bossNode.connections = [nodes[nodes.length - 1].id];
        }

        nodes.push(bossNode);
        return nodes;
    }

    // ==================== 探索 ====================

    /**
     * 组建探索队伍
     */
    public formExplorationTeam(pets: PetEntity[]): boolean {
        if (pets.length < 1 || pets.length > 5) {
            console.warn('[探索] 队伍需要1-5只萌宠');
            return false;
        }

        this.explorationTeam = {
            pets: [...pets],
            stamina: 100,
            maxStamina: 100,
            currentRegion: '',
            currentNodeId: ''
        };

        this.consecutiveWins = 0;
        console.log(`[探索] 队伍组建完成! ${pets.length}只萌宠, 体力100/100`);
        return true;
    }

    /**
     * 进入区域
     */
    public enterRegion(regionId: string): boolean {
        const region = this.regions.find(r => r.id === regionId);
        if (!region || (!region.unlocked && regionId !== 'garden')) {
            console.warn('[探索] 区域未解锁');
            return false;
        }

        if (!this.explorationTeam) {
            console.warn('[探索] 请先组建探索队伍');
            return false;
        }

        this.explorationTeam.currentRegion = regionId;
        this.explorationTeam.currentNodeId = region.nodes[0].id;

        console.log(`[探索] 🗺️ 进入「${region.name}」(难度: ${region.difficulty})`);
        return true;
    }

    /**
     * 探索当前节点
     */
    public exploreCurrentNode(): WorldReward[] | null {
        if (!this.explorationTeam) return null;

        const region = this.regions.find(r => r.id === this.explorationTeam!.currentRegion);
        if (!region) return null;

        const node = region.nodes.find(n => n.id === this.explorationTeam!.currentNodeId);
        if (!node || node.completed) return null;

        // 体力检查
        const staminaCost = node.type === NodeType.BOSS ? 15 : 
                            node.type === NodeType.ELITE ? 10 : 5;
        if (this.explorationTeam.stamina < staminaCost) {
            console.warn('[探索] 体力不足!');
            return null;
        }

        this.explorationTeam.stamina -= staminaCost;
        this.nodeCompletionsToday++;

        // 根据节点类型处理
        let rewards: WorldReward[] = [];
        const successRate = node.type === NodeType.BOSS ? 50 : 
                            node.type === NodeType.ELITE ? 65 : 80;

        if (Math.random() * 100 < successRate) {
            rewards = [...node.rewards];
            node.completed = true;
            this.consecutiveWins++;
            this.totalExplored += node.type === NodeType.BOSS ? 10 : 5;

            // 解锁相连节点
            for (const connId of node.connections) {
                const connNode = region.nodes.find(n => n.id === connId);
                if (connNode) connNode.locked = false;
            }

            // 稀有发现
            if (node.type === NodeType.TREASURE && Math.random() < 0.15) {
                this.rareFinds++;
                rewards.push({ type: 'gems', amount: 20 + region.difficulty * 10, name: '稀有宝石' });
                console.log('[探索] 💎 稀有发现!');
            }

            // 更新区域探索度
            const totalNodes = region.nodes.length;
            const completedNodes = region.nodes.filter(n => n.completed).length;
            region.explored = Math.round((completedNodes / totalNodes) * 100);

            if (node.type === NodeType.BOSS) {
                console.log(`[探索] 🏆 征服「${region.name}」! 探索度: ${region.explored}%`);
            }

            console.log(`[探索] ✅ ${node.name} 完成!`);
        } else {
            // 失败惩罚
            if (node.type === NodeType.BATTLE || node.type === NodeType.ELITE || node.type === NodeType.BOSS) {
                this.explorationTeam.stamina = Math.max(0, this.explorationTeam.stamina - 10);
                this.consecutiveWins = 0;
                console.log('[探索] ❌ 挑战失败! 体力-10');
            }
            rewards = [{ type: 'gold', amount: 10, name: '安慰奖励' }];
        }

        this.saveLocalData();
        return rewards;
    }

    /**
     * 移动到指定节点
     */
    public moveToNode(nodeId: string): boolean {
        if (!this.explorationTeam) return false;

        const region = this.regions.find(r => r.id === this.explorationTeam!.currentRegion);
        if (!region) return false;

        const targetNode = region.nodes.find(n => n.id === nodeId);
        if (!targetNode || targetNode.locked) return false;

        this.explorationTeam.currentNodeId = nodeId;
        return true;
    }

    /**
     * 解锁新区域
     */
    public unlockRegion(regionId: string): boolean {
        const region = this.regions.find(r => r.id === regionId);
        if (!region || region.unlocked) return false;

        // 检查等级要求
        if (this.explorationTeam) {
            const maxLevel = Math.max(...this.explorationTeam.pets.map(p => p.level || 1));
            if (maxLevel < region.requiredLevel) {
                console.warn(`[探索] 需要队伍最高等级达到${region.requiredLevel}`);
                return false;
            }
        }

        // TODO: 扣除金币
        region.unlocked = true;
        console.log(`[探索] 🔓 解锁新区「${region.name}」!`);
        this.saveLocalData();
        return true;
    }

    // ==================== 辅助函数 ====================

    private generateNodeName(type: NodeType, difficulty: number): string {
        const names: Record<NodeType, string[]> = {
            [NodeType.BATTLE]: ['野怪营地', '萌宠遭遇战', '小怪群', '巡逻队'],
            [NodeType.BOSS]: ['区域霸主', '混沌守护者', '元素领主'],
            [NodeType.TREASURE]: ['隐藏宝箱', '古代遗物', '秘密洞穴'],
            [NodeType.REST]: ['温泉', '圣泉', '治愈花园', '营地'],
            [NodeType.SHOP]: ['旅行商人', '神秘商人', '装备铺'],
            [NodeType.EVENT]: ['神秘足迹', '异常天气', '求救信号', '古老石碑'],
            [NodeType.PUZZLE]: ['元素谜题', '机关阵'],
            [NodeType.ELITE]: ['精英巢穴', '稀有精英'],
            [NodeType.PORTAL]: ['时空裂隙', '传送门']
        };
        const pool = names[type] || ['未知'];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    private generateNodeDescription(type: NodeType): string {
        const descs: Record<NodeType, string> = {
            [NodeType.BATTLE]: '一群野生萌宠正在此处游荡',
            [NodeType.BOSS]: '强大的区域守护者在此守卫',
            [NodeType.TREASURE]: '感觉到宝物就在附近',
            [NodeType.REST]: '一处宁静的地方，可以回复体力',
            [NodeType.SHOP]: '一个背着大包的旅行商人',
            [NodeType.EVENT]: '前方似乎发生了什么',
            [NodeType.PUZZLE]: '一个古老的机关等待着解开',
            [NodeType.ELITE]: '一只特别强大的野生萌宠',
            [NodeType.PORTAL]: '空气中弥漫着魔法能量'
        };
        return descs[type] || '未知的区域';
    }

    private generateNodeRewards(type: NodeType, difficulty: number): WorldReward[] {
        const baseGold = 50 * difficulty;
        switch (type) {
            case NodeType.BATTLE: return [
                { type: 'gold', amount: baseGold },
                { type: 'exp', amount: 20 * difficulty }
            ];
            case NodeType.ELITE: return [
                { type: 'gold', amount: baseGold * 2 },
                { type: 'exp', amount: 50 * difficulty },
                { type: 'item', amount: 1, name: '进化石' }
            ];
            case NodeType.TREASURE: return [
                { type: 'gold', amount: baseGold * 1.5 },
                { type: 'gems', amount: 5 * difficulty }
            ];
            case NodeType.PUZZLE: return [
                { type: 'gold', amount: baseGold * 3 },
                { type: 'gems', amount: 10 * difficulty }
            ];
            default: return [{ type: 'gold', amount: baseGold }];
        }
    }

    private generateEncounter(regionId: string): WorldEncounter {
        const encounters: WorldEncounter[] = [
            {
                title: '受伤的萌宠',
                description: '你发现一只受伤的萌宠，需要帮助...',
                choices: [
                    { text: '使用药草治疗(消耗金币100)', successRate: 90, successRewards: [{ type: 'pet', amount: 1, rarity: 'R', name: '获救萌宠' }], failPenalty: '萌宠逃走了' },
                    { text: '捕捉它', successRate: 40, successRewards: [{ type: 'pet', amount: 1, rarity: 'SR', name: '稀有萌宠' }], failPenalty: '萌宠反击' },
                    { text: '无视', successRate: 100, successRewards: [{ type: 'gold', amount: 50 }], failPenalty: '' }
                ]
            },
            {
                title: '神秘商人',
                description: '一个神秘商人出现在你面前，兜售各种奇珍异宝...',
                choices: [
                    { text: '购买神秘宝箱(500金币)', successRate: 70, successRewards: [{ type: 'gems', amount: 50 }, { type: 'item', amount: 1, name: '进阶石' }], failPenalty: '买到空宝箱' },
                    { text: '讨价还价', successRate: 50, successRewards: [{ type: 'gems', amount: 30 }, { type: 'gold', amount: 200 }], failPenalty: '商人生气离开' }
                ]
            },
            {
                title: '古代石碑',
                description: '你发现一块刻满古老文字的石碑...',
                choices: [
                    { text: '解读文字', successRate: 60, successRewards: [{ type: 'gems', amount: 100 }, { type: 'exp', amount: 500 }], failPenalty: '触发陷阱', requirements: { minLevel: 10 } },
                    { text: '用力推开石碑', successRate: 30, successRewards: [{ type: 'gold', amount: 3000 }], failPenalty: '被机关击伤' }
                ]
            }
        ];

        return encounters[Math.floor(Math.random() * encounters.length)];
    }

    private getBossName(regionId: string): string {
        const bosses: Record<string, string> = {
            'garden': '花园守护者·翠玉龙',
            'volcano': '熔岩霸主·焰龙王',
            'ocean': '深海暴君·沧澜鲸',
            'forest': '密林之主·远古树人',
            'temple': '神殿守护·圣光凤凰',
            'abyss': '深渊之王·暗灭霸主'
        };
        return bosses[regionId] || '未知Boss';
    }

    // ==================== 体力系统 ====================

    private startStaminaRegen(): void {
        // 每5分钟恢复1点体力
        this.staminaRegenInterval = window.setInterval(() => {
            if (this.explorationTeam && this.explorationTeam.stamina < this.explorationTeam.maxStamina) {
                this.explorationTeam.stamina = Math.min(
                    this.explorationTeam.maxStamina,
                    this.explorationTeam.stamina + 1
                );
            }
            this.saveLocalData();
        }, 5 * 60 * 1000);
    }

    public refillStamina(gems: number): boolean {
        if (!this.explorationTeam) return false;
        if (gems < 10) return false;

        this.explorationTeam.stamina = this.explorationTeam.maxStamina;
        console.log('[探索] ⚡ 体力已回满');
        return true;
    }

    // ==================== 每日重置 ====================

    public dailyReset(): void {
        this.nodeCompletionsToday = 0;
        // 重置节点进度(部分)
        this.regions.forEach(region => {
            region.nodes.forEach(node => {
                if (node.type === NodeType.TREASURE || node.type === NodeType.SHOP) {
                    node.completed = false; // 宝箱和商店每日刷新
                }
            });
        });
        this.saveLocalData();
    }

    // ==================== 数据持久化 ====================

    private loadLocalData(): void {
        try {
            const data = JSON.parse(GameConfig.loadLocal('worldmap_data') || '{}');
            if (data.regions) this.regions = data.regions;
            if (data.explorationHistory) this.explorationHistory = data.explorationHistory;
            if (data.totalExplored) this.totalExplored = data.totalExplored;
            if (data.rareFinds) this.rareFinds = data.rareFinds;
        } catch {}
    }

    private saveLocalData(): void {
        GameConfig.saveLocal('worldmap_data', JSON.stringify({
            regions: this.regions,
            explorationHistory: this.explorationHistory,
            totalExplored: this.totalExplored,
            rareFinds: this.rareFinds
        }));
    }

    // ==================== Getter ====================

    public getRegions(): WorldRegion[] { return this.regions; }
    public getUnlockedRegions(): WorldRegion[] { return this.regions.filter(r => r.unlocked); }
    public getCurrentRegion(): WorldRegion | null {
        if (!this.explorationTeam?.currentRegion) return null;
        return this.regions.find(r => r.id === this.explorationTeam!.currentRegion) || null;
    }
    public getCurrentNode(): WorldNode | null { return this.currentNode; }
    public getExplorationTeam(): ExplorationTeam | null { return this.explorationTeam; }
    public getTotalExplored(): number { return this.totalExplored; }
    public getRareFinds(): number { return this.rareFinds; }
    public getNodeCompletionsToday(): number { return this.nodeCompletionsToday; }

    public getRegionProgress(): { name: string; explored: number }[] {
        return this.regions
            .filter(r => r.unlocked && r.explored > 0)
            .map(r => ({ name: r.name, explored: r.explored }));
    }
}
