/**
 * PetBreedingSystem - 萌宠繁衍/融合系统
 * 支持配对繁衍、属性遗传、稀有度继承、融合进化
 */

import { PetEntity, PetRarity } from '../entities/PetEntity';
import { GameConfig } from '../GameConfig';

// 繁衍配对
export interface BreedingPair {
    parent1: PetEntity;
    parent2: PetEntity;
    compatibility: number;     // 兼容度 0-100
    breedingTime: number;      // 繁衍时间(秒)
    cost: number;              // 金币消耗
    successRate: number;       // 成功率
}

// 繁衍结果
export interface BreedingResult {
    success: boolean;
    egg: PetEgg | null;
    failReason?: string;
}

// 宠物蛋
export interface PetEgg {
    id: string;
    parent1Id: string;
    parent2Id: string;
    rarityHint: PetRarity;     // 蛋的稀有度提示
    hatchTime: number;         // 孵化时间(秒)
    laidAt: number;            // 产蛋时间戳
    readyAt: number;           // 可孵化时间戳
    elementHint: string;       // 元素倾向
    description: string;
}

// 孵化的萌宠
export interface HatchedPet {
    pet: PetEntity;
    inheritedTraits: InheritedTrait[];
    isShiny: boolean;          // 闪光(极稀有)
    bonusStats: BonusStats;
}

// 继承特性
export interface InheritedTrait {
    name: string;
    source: 'parent1' | 'parent2' | 'mutation';
    description: string;
    value: number;
}

// 额外属性加成
interface BonusStats {
    attack: number;
    defense: number;
    hp: number;
}

// 融合配方
export interface FusionRecipe {
    id: string;
    name: string;
    description: string;
    materials: { petType: string; count: number; level: number }[];
    result: {
        name: string;
        rarity: PetRarity;
        elementType: string;
        guaranteedSkill: string;
        bonusDescription: string;
    };
    requiredLevel: number;
    cost: number;
    unlockCondition: string;
}

// 融合结果
export interface FusionResult {
    success: boolean;
    newPet: PetEntity | null;
    consumedMaterials: string[];
    message: string;
}

export class PetBreedingSystem {
    private static instance: PetBreedingSystem;

    // 繁衍槽位
    private readonly MAX_BREEDING_SLOTS = 3;
    private activeBreedings: Map<string, BreedingPair> = new Map();
    private eggs: PetEgg[] = [];
    private totalBred: number = 0;
    private totalHatched: number = 0;
    private shinyCount: number = 0;

    // 融合配方库
    private fusionRecipes: FusionRecipe[] = [];

    // 繁衍增强道具
    private breedingBoosters: Map<string, BoosterEffect> = new Map();

    interface BoosterEffect {
        type: 'compatibility' | 'time_reduction' | 'success_rate' | 'shiny_chance';
        value: number;
        remaining: number;
    }

    private constructor() {
        this.initFusionRecipes();
        this.loadLocalData();
    }

    public static getInstance(): PetBreedingSystem {
        if (!PetBreedingSystem.instance) {
            PetBreedingSystem.instance = new PetBreedingSystem();
        }
        return PetBreedingSystem.instance;
    }

    // ==================== 兼容度计算 ====================

    /**
     * 计算两只萌宠的繁衍兼容度
     */
    public calculateCompatibility(pet1: PetEntity, pet2: PetEntity): BreedingPair {
        let score = 0;

        // 同类萌宠 +30
        if (pet1.name === pet2.name) score += 30;

        // 同元素 +20
        if (pet1.elementType === pet2.elementType) score += 20;

        // 互补元素 +15 (火+草, 水+光, 暗+光)
        const complementary: Record<string, string[]> = {
            'fire': ['grass', 'dark'],
            'water': ['light', 'grass'],
            'grass': ['fire', 'water'],
            'light': ['dark', 'water'],
            'dark': ['light', 'fire']
        };
        if (complementary[pet1.elementType]?.includes(pet2.elementType)) {
            score += 15;
        }

        // 稀有度匹配 +稀有度差值奖励
        const rarityOrder = ['N', 'R', 'SR', 'SSR', 'UR'];
        const r1Idx = rarityOrder.indexOf(pet1.rarity);
        const r2Idx = rarityOrder.indexOf(pet2.rarity);
        if (r1Idx === r2Idx) score += 25;           // 同稀有度
        else score += Math.max(0, 15 - Math.abs(r1Idx - r2Idx) * 5);

        // 高星 +starLevel
        score += (pet1.starLevel + pet2.starLevel) * 2;

        // 高等级 +level
        const lv1 = pet1.level || 1;
        const lv2 = pet2.level || 1;
        score += Math.floor(Math.min(lv1 + lv2, 50) / 2);

        // 上限100
        score = Math.min(score, 100);

        // 计算繁衍时间和成本
        const time = 300 + (100 - score) * 3 + r1Idx * 60 + r2Idx * 60;
        const cost = 200 + (r1Idx + r2Idx) * 100;
        const successRate = 60 + score * 0.35;

        return {
            parent1: pet1,
            parent2: pet2,
            compatibility: score,
            breedingTime: time,
            cost,
            successRate: Math.min(successRate, 98)  // 最高98%
        };
    }

    // ==================== 繁衍 ====================

    /**
     * 开始繁衍
     */
    public startBreeding(pet1: PetEntity, pet2: PetEntity, slotId: string = 'default'): BreedingResult {
        if (this.activeBreedings.size >= this.MAX_BREEDING_SLOTS) {
            return { success: false, egg: null, failReason: '繁衍槽位已满' };
        }

        const pair = this.calculateCompatibility(pet1, pet2);
        
        // 应用增强道具
        let actualSuccess = pair.successRate;
        this.breedingBoosters.forEach(booster => {
            if (booster.type === 'success_rate') actualSuccess += booster.value;
        });

        if (Math.random() * 100 > actualSuccess) {
            return { 
                success: false, 
                egg: null, 
                failReason: `繁衍失败 (成功率${actualSuccess.toFixed(1)}%)` 
            };
        }

        // 创建蛋
        const rarityHint = this.determineEggRarity(pet1, pet2);
        const elementHint = Math.random() < 0.5 ? pet1.elementType : pet2.elementType;
        const now = Date.now();
        let hatchTime = pair.breedingTime;

        // 时间缩减道具
        this.breedingBoosters.forEach(booster => {
            if (booster.type === 'time_reduction') hatchTime *= (1 - booster.value);
        });

        const egg: PetEgg = {
            id: `egg_${now}_${Math.random().toString(36).substr(2, 6)}`,
            parent1Id: pet1.id,
            parent2Id: pet2.id,
            rarityHint,
            hatchTime: Math.max(hatchTime, 60), // 最少60秒
            laidAt: now,
            readyAt: now + Math.max(hatchTime, 60) * 1000,
            elementHint,
            description: `${rarityHint}级蛋 - 散发着${elementHint === 'fire' ? '温暖' : elementHint === 'water' ? '湿润' : elementHint === 'grass' ? '清新' : elementHint === 'light' ? '光明' : '神秘'}的气息`
        };

        this.eggs.push(egg);
        this.totalBred++;
        this.saveLocalData();

        console.log(`[繁衍] 获得宠物蛋! ${rarityHint}级, ${elementHint}元素, 孵化倒计时: ${hatchTime}秒`);
        return { success: true, egg };
    }

    /**
     * 确定蛋的稀有度
     */
    private determineEggRarity(pet1: PetEntity, pet2: PetEntity): PetRarity {
        const rarityOrder = ['N', 'R', 'SR', 'SSR', 'UR'];
        const r1 = rarityOrder.indexOf(pet1.rarity);
        const r2 = rarityOrder.indexOf(pet2.rarity);
        const maxRarity = Math.max(r1, r2);
        
        const roll = Math.random() * 100;
        
        // 闪光概率(独立计算)
        if (Math.random() < (0.5 + (r1 + r2) * 0.3) / 100) {
            // 闪光蛋总是高一级
            const boostedRarity = Math.min(maxRarity + 1, 4);
            return rarityOrder[boostedRarity] as PetRarity;
        }

        // 稀有度继承概率
        if (roll < 3) return rarityOrder[Math.min(maxRarity + 1, 4)] as PetRarity;  // 3% 越级
        if (roll < 20) return rarityOrder[maxRarity] as PetRarity;                  // 17% 继承最高
        if (roll < 55) return rarityOrder[Math.max(maxRarity - 1, 0)] as PetRarity; // 35% 低一级
        if (roll < 85) return rarityOrder[Math.max(maxRarity - 2, 0)] as PetRarity; // 30% 低两级
        return 'N';
    }

    // ==================== 孵化 ====================

    /**
     * 孵化宠物蛋
     */
    public hatchEgg(eggId: string): HatchedPet | null {
        const eggIndex = this.eggs.findIndex(e => e.id === eggId);
        if (eggIndex < 0) return null;

        const egg = this.eggs[eggIndex];
        if (Date.now() < egg.readyAt) {
            console.warn(`[孵化] 蛋还未准备好! 还需${Math.ceil((egg.readyAt - Date.now()) / 1000)}秒`);
            return null;
        }

        // 移除蛋
        this.eggs.splice(eggIndex, 1);

        // 生成萌宠
        const rarity = egg.rarityHint;
        const isShiny = Math.random() < 0.01;
        
        if (isShiny) this.shinyCount++;

        // 属性继承（带变异）
        const statsRoll = () => 0.7 + Math.random() * 0.6; // 0.7-1.3倍

        const newPet: PetEntity = {
            id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: isShiny ? '✨闪光萌宠' : this.generateHatchedPetName(rarity, egg.elementHint),
            rarity,
            level: 1,
            elementType: egg.elementHint,
            attack: Math.floor((10 + rarityOrder(rarity) * 8) * statsRoll()),
            defense: Math.floor((8 + rarityOrder(rarity) * 6) * statsRoll()),
            hp: Math.floor((50 + rarityOrder(rarity) * 30) * statsRoll()),
            starLevel: 1,
            skills: this.generateHatchedSkills(rarity),
            evolutionLine: undefined
        };

        // 继承特性
        const traits: InheritedTrait[] = [
            {
                name: '血脉传承',
                source: 'parent1',
                description: `父辈的基础属性加成`,
                value: 0.05 + rarityOrder(rarity) * 0.03
            }
        ];

        if (isShiny) {
            traits.push({
                name: '闪光基因',
                source: 'mutation',
                description: '全属性+30%',
                value: 0.30
            });
        }

        const bonusStats: BonusStats = {
            attack: isShiny ? Math.floor(newPet.attack * 0.3) : 0,
            defense: isShiny ? Math.floor(newPet.defense * 0.3) : 0,
            hp: isShiny ? Math.floor(newPet.hp * 0.3) : 0
        };

        this.totalHatched++;
        this.saveLocalData();

        console.log(`[孵化] 🐣 ${newPet.name} 孵化成功! ${rarity}级 ${isShiny ? '✨闪光!' : ''}`);
        return { pet: newPet, inheritedTraits: traits, isShiny, bonusStats };
    }

    /**
     * 加速孵化（消耗钻石）
     */
    public speedHatch(eggId: string, gems: number): boolean {
        const egg = this.eggs.find(e => e.id === eggId);
        if (!egg || egg.readyAt <= Date.now()) return false;

        const remaining = Math.ceil((egg.readyAt - Date.now()) / 1000);
        const gemsNeeded = Math.ceil(remaining / 60); // 1钻石=减少60秒

        if (gems < gemsNeeded) return false;

        egg.readyAt = Date.now();
        this.saveLocalData();
        return true;
    }

    // ==================== 融合系统 ====================

    private initFusionRecipes(): void {
        this.fusionRecipes = [
            {
                id: 'fusion_fire_dragon',
                name: '炎龙融合',
                description: '融合三只火系萌宠召唤炎龙幼崽',
                materials: [
                    { petType: 'fire', count: 3, level: 10 }
                ],
                result: {
                    name: '炎龙幼崽',
                    rarity: 'SSR',
                    elementType: 'fire',
                    guaranteedSkill: '龙息烈焰',
                    bonusDescription: '火系伤害+50%'
                },
                requiredLevel: 15,
                cost: 5000,
                unlockCondition: '拥有5只火系萌宠'
            },
            {
                id: 'fusion_sea_guardian',
                name: '海神融合',
                description: '融合三只水系萌宠召唤海神卫士',
                materials: [
                    { petType: 'water', count: 3, level: 10 }
                ],
                result: {
                    name: '海神卫士',
                    rarity: 'SSR',
                    elementType: 'water',
                    guaranteedSkill: '海啸冲击',
                    bonusDescription: '水系伤害+50%'
                },
                requiredLevel: 15,
                cost: 5000,
                unlockCondition: '拥有5只水系萌宠'
            },
            {
                id: 'fusion_rainbow',
                name: '彩虹融合',
                description: '融合五种不同元素萌宠召唤彩虹守护者',
                materials: [
                    { petType: 'fire', count: 1, level: 5 },
                    { petType: 'water', count: 1, level: 5 },
                    { petType: 'grass', count: 1, level: 5 },
                    { petType: 'light', count: 1, level: 5 },
                    { petType: 'dark', count: 1, level: 5 }
                ],
                result: {
                    name: '彩虹守护者',
                    rarity: 'UR',
                    elementType: 'light',
                    guaranteedSkill: '七彩神光',
                    bonusDescription: '全属性攻击+30%，受到伤害-20%'
                },
                requiredLevel: 25,
                cost: 50000,
                unlockCondition: '收集各元素萌宠至少2只'
            }
        ];
    }

    /**
     * 融合萌宠
     */
    public fusionPets(recipeId: string, pets: PetEntity[]): FusionResult {
        const recipe = this.fusionRecipes.find(r => r.id === recipeId);
        if (!recipe) return { success: false, newPet: null, consumedMaterials: [], message: '配方不存在' };

        // 验证材料
        for (const material of recipe.materials) {
            const matching = pets.filter(p => p.elementType === material.petType && p.level >= material.level);
            if (matching.length < material.count) {
                return {
                    success: false, newPet: null, consumedMaterials: [],
                    message: `缺少 ${material.count}只${material.level}级以上的${material.petType}系萌宠`
                };
            }
        }

        // 消耗材料宠
        const consumed: string[] = [];
        for (const material of recipe.materials) {
            const matching = pets.filter(p => p.elementType === material.petType && p.level >= material.level);
            for (let i = 0; i < material.count; i++) {
                consumed.push(matching[i].id);
            }
        }

        // 生成融合萌宠
        const newPet: PetEntity = {
            id: `fusion_${Date.now()}`,
            name: recipe.result.name,
            rarity: recipe.result.rarity,
            level: Math.max(...recipe.materials.map(m => m.level)),
            elementType: recipe.result.elementType,
            attack: 80 + rarityOrder(recipe.result.rarity) * 25,
            defense: 60 + rarityOrder(recipe.result.rarity) * 20,
            hp: 500 + rarityOrder(recipe.result.rarity) * 150,
            starLevel: 3,
            skills: [{
                name: recipe.result.guaranteedSkill,
                damage: 200 + rarityOrder(recipe.result.rarity) * 50,
                cooldown: 5 - Math.floor(rarityOrder(recipe.result.rarity) / 2),
                description: recipe.result.bonusDescription
            }],
            evolutionLine: undefined
        };

        console.log(`[融合] ⚗️ 融合成功! 获得 ${newPet.name} (${newPet.rarity})! ${recipe.result.bonusDescription}`);
        return { success: true, newPet, consumedMaterials: consumed, message: `融合成功! 获得${newPet.name}!` };
    }

    // ==================== 辅助函数 ====================

    private generateHatchedPetName(rarity: PetRarity, element: string): string {
        const names: Record<string, string[]> = {
            'fire': ['焰崽', '小炎', '灼灼', '火苗', '熔岩崽'],
            'water': ['水灵', '泡芙', '涟漪', '蓝晶', '泡泡'],
            'grass': ['草芽', '青青', '藤蔓', '嫩叶', '竹笋'],
            'light': ['光灵', '星崽', '闪亮', '晨辉', '彩翼'],
            'dark': ['影崽', '暗星', '夜灵', '墨墨', '虚灵']
        };

        const pool = names[element] || names['light'];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    private generateHatchedSkills(rarity: PetRarity): any[] {
        const skillPool: Record<string, any[]> = {
            'N': [{ name: '撞击', damage: 50, cooldown: 0, description: '基础攻击' }],
            'R': [{ name: '元素波', damage: 70, cooldown: 1, description: '元素攻击' }],
            'SR': [{ name: '能量爆发', damage: 100, cooldown: 2, description: '中等伤害' }],
            'SSR': [
                { name: '终极冲击', damage: 150, cooldown: 3, description: '高额伤害' },
                { name: '守护', damage: 0, cooldown: 4, description: '回复HP' }
            ],
            'UR': [
                { name: '传说之技', damage: 250, cooldown: 4, description: '传说级伤害' },
                { name: '神之祝福', damage: 0, cooldown: 3, description: '大幅回复' }
            ]
        };

        return skillPool[rarity] || skillPool['N'];
    }

    // ==================== 道具效果 ====================

    public useBreedingBooster(type: string, value: number, uses: number): void {
        this.breedingBoosters.set(`booster_${Date.now()}`, {
            type: type as any,
            value,
            remaining: uses
        });
    }

    // ==================== 数据持久化 ====================

    private loadLocalData(): void {
        try {
            const data = JSON.parse(GameConfig.loadLocal('breeding_data') || '{}');
            this.eggs = data.eggs || [];
            this.totalBred = data.totalBred || 0;
            this.totalHatched = data.totalHatched || 0;
            this.shinyCount = data.shinyCount || 0;
        } catch {}
    }

    private saveLocalData(): void {
        GameConfig.saveLocal('breeding_data', JSON.stringify({
            eggs: this.eggs,
            totalBred: this.totalBred,
            totalHatched: this.totalHatched,
            shinyCount: this.shinyCount
        }));
    }

    // ==================== Getter ====================

    public getEggs(): PetEgg[] { return this.eggs; }
    public getTotalBred(): number { return this.totalBred; }
    public getTotalHatched(): number { return this.totalHatched; }
    public getShinyCount(): number { return this.shinyCount; }
    public getFusionRecipes(): FusionRecipe[] { return this.fusionRecipes; }
    public getActiveBreedingCount(): number { return this.activeBreedings.size; }
    public getMaxBreedingSlots(): number { return this.MAX_BREEDING_SLOTS; }
}

function rarityOrder(r: PetRarity): number {
    return { 'N': 0, 'R': 1, 'SR': 2, 'SSR': 3, 'UR': 4 }[r] || 0;
}
