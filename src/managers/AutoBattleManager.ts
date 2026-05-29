/**
 * AutoBattleManager - 自动战斗管理器
 * 支持AI自动战斗、战斗回放、策略配置
 */

import { PetEntity, PetRarity } from '../entities/PetEntity';
import { GameConfig } from '../GameConfig';

// 回合记录
export interface TurnRecord {
    turn: number;
    attackerId: string;
    attackerName: string;
    defenderId: string;
    defenderName: string;
    skillName: string;
    damage: number;
    isCrit: boolean;
    isEffective: boolean;  // 属性克制
    attackerHp: number;
    defenderHp: number;
    description: string;
}

// 战斗结果
export interface AutoBattleResult {
    win: boolean;
    totalTurns: number;
    defeatedCount: number;
    survivedCount: number;
    totalDamageDealt: number;
    totalDamageTaken: number;
    totalHealing: number;
    mvpPetId: string;
    mvpDamage: number;
    turnRecords: TurnRecord[];
    dropRewards: Reward[];
    expRewards: ExpReward[];
}

interface Reward {
    type: string;
    id: string;
    name: string;
    amount: number;
}

interface ExpReward {
    petId: string;
    petName: string;
    expGained: number;
    levelUp: boolean;
    newLevel: number;
}

// AI策略
export enum AIStrategy {
    AGGRESSIVE = 'aggressive',     // 优先高伤害技能
    DEFENSIVE = 'defensive',       // 优先治疗/护盾
    BALANCED = 'balanced',         // 均衡策略
    ELEMENTAL = 'elemental',       // 优先属性克制
    FOCUS_FIRE = 'focus_fire',    // 集火最弱目标
    BOSS_KILLER = 'boss_killer'   // Boss战专精
}

// 技能定义
interface BattleSkill {
    name: string;
    damage: number;
    type: 'attack' | 'heal' | 'buff' | 'debuff' | 'shield';
    cooldown: number;
    currentCooldown: number;
    healAmount?: number;
    buffAmount?: number;
}

export class AutoBattleManager {
    private static instance: AutoBattleManager;
    
    private battleSpeed: number = 1;   // 1x, 2x, 4x
    private isBattling: boolean = false;
    private isPaused: boolean = false;
    private lastBattleResult: AutoBattleResult | null = null;
    private totalBattles: number = 0;
    private totalWins: number = 0;
    private strategy: AIStrategy = AIStrategy.BALANCED;
    
    // 回调
    private onTurnComplete: ((record: TurnRecord) => void) | null = null;
    private onBattleComplete: ((result: AutoBattleResult) => void) | null = null;

    private constructor() {
        this.loadLocalData();
    }

    public static getInstance(): AutoBattleManager {
        if (!AutoBattleManager.instance) {
            AutoBattleManager.instance = new AutoBattleManager();
        }
        return AutoBattleManager.instance;
    }

    // ==================== 自动战斗主逻辑 ====================

    /**
     * 执行自动战斗
     */
    public async executeAutoBattle(
        allyPets: PetEntity[],
        enemyPets: PetEntity[],
        strategy: AIStrategy = AIStrategy.BALANCED,
        maxTurns: number = 50
    ): Promise<AutoBattleResult> {
        this.isBattling = true;
        this.isPaused = false;
        this.strategy = strategy;

        // 深拷贝萌宠数据
        const allies = allyPets.map(p => this.prepareBattlePet(p));
        const enemies = enemyPets.map(p => this.prepareBattlePet(p));

        const turnRecords: TurnRecord[] = [];
        let turn = 0;
        const damageDealt: Map<string, number> = new Map();
        let totalDamageTaken = 0;
        let totalHealing = 0;

        while (turn < maxTurns && allies.length > 0 && enemies.length > 0) {
            if (this.isPaused) {
                await this.sleep(100);
                continue;
            }

            turn++;

            // 按速度排序决定行动顺序
            const actionOrder = this.getActionOrder(allies, enemies);

            for (const pet of actionOrder) {
                if (allies.length === 0 || enemies.length === 0) break;

                const isAlly = allies.includes(pet);
                const attackerTeam = isAlly ? allies : enemies;
                const defenderTeam = isAlly ? enemies : allies;

                // 选择技能
                const skill = this.selectSkill(pet, isAlly ? strategy : AIStrategy.BALANCED);
                
                // 选择目标
                const target = this.selectTarget(defenderTeam, strategy);
                if (!target) continue;

                // 计算伤害
                const typeMultiplier = this.getTypeMultiplier(pet.elementType, target.elementType);
                const isCrit = Math.random() < 0.12;
                const baseDamage = skill.type === 'attack' ? 
                    (pet.attack * skill.damage / 100) : 0;
                const damage = Math.round(baseDamage * typeMultiplier * (isCrit ? 1.8 : 1) * 
                    (0.85 + Math.random() * 0.3));

                // 治疗
                let healing = 0;
                if (skill.type === 'heal' && skill.healAmount) {
                    const lowestHpAlly = allies.reduce((a, b) => 
                        (a.currentHp || 0) / a.hp < (b.currentHp || 0) / b.hp ? a : b
                    );
                    healing = Math.round(pet.attack * (skill.healAmount / 100));
                    lowestHpAlly.currentHp = Math.min(
                        (lowestHpAlly.currentHp || lowestHpAlly.hp) + healing,
                        lowestHpAlly.hp
                    );
                    totalHealing += healing;
                }

                // 造成伤害
                if (skill.type === 'attack') {
                    target.currentHp = (target.currentHp || target.hp) - damage;
                    
                    const prevDmg = damageDealt.get(pet.id) || 0;
                    damageDealt.set(pet.id, prevDmg + damage);

                    if (isAlly) {
                        totalDamageTaken += damage;
                    }
                }

                // 记录回合
                const record: TurnRecord = {
                    turn,
                    attackerId: pet.id,
                    attackerName: pet.name,
                    defenderId: target.id,
                    defenderName: target.name,
                    skillName: skill.name,
                    damage: skill.type === 'heal' ? healing : damage,
                    isCrit,
                    isEffective: typeMultiplier > 1,
                    attackerHp: pet.currentHp || pet.hp,
                    defenderHp: Math.max(0, target.currentHp || 0),
                    description: this.generateTurnDescription(skill, pet, target, damage, healing, isCrit, typeMultiplier)
                };

                turnRecords.push(record);
                this.onTurnComplete?.(record);

                // 移除阵亡单位
                const deadAllies = allies.filter(a => (a.currentHp || 0) <= 0);
                const deadEnemies = enemies.filter(e => (e.currentHp || 0) <= 0);
                deadAllies.forEach(d => {
                    const idx = allies.indexOf(d);
                    if (idx >= 0) allies.splice(idx, 1);
                });
                deadEnemies.forEach(d => {
                    const idx = enemies.indexOf(d);
                    if (idx >= 0) enemies.splice(idx, 1);
                });

                // 冷却管理
                if (skill.currentCooldown !== undefined) skill.currentCooldown = skill.cooldown;
            }
        }

        // 结算
        const win = enemies.length === 0;
        const result: AutoBattleResult = {
            win,
            totalTurns: turn,
            defeatedCount: allyPets.length - allies.length,
            survivedCount: allies.length,
            totalDamageDealt: Array.from(damageDealt.values()).reduce((a, b) => a + b, 0),
            totalDamageTaken,
            totalHealing,
            mvpPetId: this.findMVP(damageDealt),
            mvpDamage: Math.max(...Array.from(damageDealt.values()), 0),
            turnRecords,
            dropRewards: this.generateDrops(win, enemyPets),
            expRewards: this.generateExpRewards(allyPets, win, turn)
        };

        this.isBattling = false;
        this.totalBattles++;
        if (win) this.totalWins++;
        this.lastBattleResult = result;
        this.saveLocalData();

        this.onBattleComplete?.(result);
        return result;
    }

    // ==================== AI决策 ====================

    /**
     * 选出行动顺序（按速度降序）
     */
    private getActionOrder(allies: BattlePet[], enemies: BattlePet[]): BattlePet[] {
        return [...allies, ...enemies].sort((a, b) => {
            const speedA = a.speed || a.starLevel * 5 + (a.level || 1);
            const speedB = b.speed || b.starLevel * 5 + (b.level || 1);
            return speedB - speedA + (Math.random() > 0.5 ? 0.1 : -0.1);
        });
    }

    /**
     * AI选择技能
     */
    private selectSkill(pet: BattlePet, strategy: AIStrategy): BattleSkill {
        // 基础技能
        const skills: BattleSkill[] = [
            { name: '普通攻击', damage: 100, type: 'attack', cooldown: 0, currentCooldown: 0 }
        ];

        // 添加宠物技能
        if (pet.skills) {
            for (const s of pet.skills) {
                const cooldown = s.cooldown || 0;
                skills.push({
                    name: s.name,
                    damage: s.damage || 80,
                    type: 'attack',
                    cooldown,
                    currentCooldown: 0
                });
            }
        }

        // 根据稀有度添加技能
        const raritySkills: Record<string, BattleSkill[]> = {
            'N': [{ name: '爪击', damage: 80, type: 'attack', cooldown: 0, currentCooldown: 0 }],
            'R': [{ name: '元素冲击', damage: 120, type: 'attack', cooldown: 2, currentCooldown: 0 }],
            'SR': [
                { name: '元素爆发', damage: 150, type: 'attack', cooldown: 3, currentCooldown: 0 },
                { name: '治愈术', damage: 0, type: 'heal', cooldown: 4, currentCooldown: 0, healAmount: 80 }
            ],
            'SSR': [
                { name: '终极技能', damage: 200, type: 'attack', cooldown: 4, currentCooldown: 0 },
                { name: '圣光术', damage: 0, type: 'heal', cooldown: 3, currentCooldown: 0, healAmount: 120 }
            ],
            'UR': [
                { name: '神话技', damage: 300, type: 'attack', cooldown: 5, currentCooldown: 0 },
                { name: '神愈', damage: 0, type: 'heal', cooldown: 3, currentCooldown: 0, healAmount: 200 }
            ]
        };

        if (raritySkills[pet.rarity]) {
            skills.push(...raritySkills[pet.rarity]);
        }

        // 策略选择
        const availableSkills = skills.filter(s => s.currentCooldown <= 0);
        if (availableSkills.length === 0) return skills[0];

        switch (strategy) {
            case AIStrategy.AGGRESSIVE:
                return availableSkills.reduce((a, b) => 
                    (b.damage || 0) > (a.damage || 0) ? b : a
                );
            case AIStrategy.DEFENSIVE:
                const heal = availableSkills.find(s => s.type === 'heal');
                if (heal && (pet.currentHp || pet.hp) < pet.hp * 0.5) return heal;
                return availableSkills[Math.floor(Math.random() * availableSkills.length)];
            default:
                return availableSkills[Math.floor(Math.random() * availableSkills.length)];
        }
    }

    /**
     * 选择攻击目标
     */
    private selectTarget(enemies: BattlePet[], strategy: AIStrategy): BattlePet | null {
        if (enemies.length === 0) return null;

        switch (strategy) {
            case AIStrategy.FOCUS_FIRE:
            case AIStrategy.BOSS_KILLER:
                // 集火血量最低的
                return enemies.reduce((a, b) => 
                    (a.currentHp || a.hp) < (b.currentHp || b.hp) ? a : b
                );
            default:
                return enemies[Math.floor(Math.random() * enemies.length)];
        }
    }

    // ==================== 辅助计算 ====================

    private getTypeMultiplier(atkType: string, defType: string): number {
        const chart: Record<string, Record<string, number>> = {
            'fire': { grass: 1.5, water: 0.5, dark: 1.2 },
            'water': { fire: 1.5, grass: 0.5, light: 1.2 },
            'grass': { water: 1.5, fire: 0.5, dark: 1.2 },
            'light': { dark: 1.5, light: 0.75 },
            'dark': { light: 1.5, dark: 0.75 }
        };
        return chart[atkType]?.[defType] || 1.0;
    }

    private findMVP(damageMap: Map<string, number>): string {
        let maxDmg = 0;
        let mvpId = '';
        damageMap.forEach((dmg, id) => {
            if (dmg > maxDmg) { maxDmg = dmg; mvpId = id; }
        });
        return mvpId;
    }

    private generateTurnDescription(
        skill: BattleSkill, attacker: BattlePet, target: BattlePet,
        damage: number, healing: number, isCrit: boolean, multiplier: number
    ): string {
        if (skill.type === 'heal') {
            return `${attacker.name} 使用 ${skill.name} 回复了 ${healing} 点生命`;
        }
        
        let desc = `${attacker.name} 使用 ${skill.name} 对 ${target.name} 造成 ${damage} 点伤害`;
        if (isCrit) desc += ' (暴击!)';
        if (multiplier > 1) desc += ' (效果拔群!)';
        if (multiplier < 1) desc += ' (效果不佳)';
        if ((target.currentHp || 0) <= 0) desc += ` ${target.name} 被击败!`;
        
        return desc;
    }

    // ==================== 结算 ====================

    private generateDrops(win: boolean, enemies: PetEntity[]): Reward[] {
        const rewards: Reward[] = [];
        
        const baseGold = win ? 50 + Math.floor(Math.random() * 50) : 10;
        rewards.push({ type: 'coins', id: 'gold', name: '金币', amount: baseGold });

        if (win && Math.random() < 0.15) {
            rewards.push({ type: 'items', id: 'evo_stone', name: '进化石', amount: 1 });
        }

        if (win && Math.random() < 0.05) {
            const pet = enemies[Math.floor(Math.random() * enemies.length)];
            rewards.push({ type: 'pet', id: pet.id, name: pet.name, amount: 1 });
        }

        return rewards;
    }

    private generateExpRewards(pets: PetEntity[], win: boolean, turns: number): ExpReward[] {
        const baseExp = win ? 100 + turns * 5 : 20;
        return pets.map(p => ({
            petId: p.id,
            petName: p.name,
            expGained: baseExp,
            levelUp: false, // 简化，实际由外部系统处理
            newLevel: 0
        }));
    }

    // ==================== 战斗宠物准备 ====================

    private prepareBattlePet(pet: PetEntity): BattlePet {
        return {
            ...pet,
            currentHp: pet.hp,
            currentCooldowns: new Map()
        };
    }

    // ==================== 控制 ====================

    public pause(): void { this.isPaused = true; }
    public resume(): void { this.isPaused = false; }
    public setSpeed(speed: number): void { this.battleSpeed = Math.min(Math.max(speed, 1), 4); }
    public stop(): void { this.isBattling = false; this.isPaused = false; }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms / this.battleSpeed));
    }

    // ==================== 数据持久化 ====================

    private loadLocalData(): void {
        try {
            const data = JSON.parse(GameConfig.loadLocal('autobattle_data') || '{}');
            this.totalBattles = data.totalBattles || 0;
            this.totalWins = data.totalWins || 0;
        } catch {}
    }

    private saveLocalData(): void {
        GameConfig.saveLocal('autobattle_data', JSON.stringify({
            totalBattles: this.totalBattles,
            totalWins: this.totalWins
        }));
    }

    // ==================== Getter ====================

    public getLastResult(): AutoBattleResult | null { return this.lastBattleResult; }
    public getWinRate(): number {
        return this.totalBattles > 0 ? Math.round((this.totalWins / this.totalBattles) * 100) : 0;
    }
    public getTotalBattles(): number { return this.totalBattles; }
    public isActive(): boolean { return this.isBattling; }
    public setCallbacks(onTurn: (r: TurnRecord) => void, onComplete: (r: AutoBattleResult) => void): void {
        this.onTurnComplete = onTurn;
        this.onBattleComplete = onComplete;
    }
}

// 战斗中的萌宠（扩展属性）
interface BattlePet extends PetEntity {
    currentHp?: number;
    currentCooldowns?: Map<string, number>;
    speed?: number;
}
