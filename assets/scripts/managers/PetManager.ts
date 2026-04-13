import { _decorator, Component, Node, Label, Button, Sprite, Animation } from 'cc';
import { GameConfig } from '../config/GameConfig';

const { ccclass, property } = _decorator;

/**
 * 萌宠数据类
 */
export class PetData {
    id: string;
    name: string;
    rarity: 'N' | 'R' | 'SR' | 'SSR';
    element: 'FIRE' | 'WATER' | 'GRASS' | 'LIGHT' | 'DARK';
    level: number = 1;
    exp: number = 0;
    attack: number;
    defense: number;
    hp: number;
    skillId: string;
    
    constructor(config: any) {
        this.id = config.id;
        this.name = config.name;
        this.rarity = config.rarity;
        this.element = config.element;
        this.attack = config.attack;
        this.defense = config.defense;
        this.hp = config.hp;
        this.skillId = config.skillId;
    }
}

/**
 * 萌宠管理器
 * 负责萌宠的获取、升级、出战等逻辑
 */
@ccclass('PetManager')
export class PetManager extends Component {
    
    // 单例
    private static _instance: PetManager = null;
    public static get instance(): PetManager {
        return PetManager._instance;
    }
    
    // 所有萌宠配置
    private petConfigs: Map<string, any> = new Map();
    
    // 玩家拥有的萌宠
    private ownedPets: PetData[] = [];
    
    // 当前出战阵容
    private battleTeam: PetData[] = [];
    
    onLoad() {
        if (PetManager._instance === null) {
            PetManager._instance = this;
        }
        this.loadPetConfigs();
    }
    
    /**
     * 加载萌宠配置
     */
    loadPetConfigs() {
        // 这里从JSON配置文件加载
        const configs = [
            {
                id: 'pet_001',
                name: '火焰喵',
                rarity: 'R',
                element: 'FIRE',
                attack: 100,
                defense: 50,
                hp: 300,
                skillId: 'skill_fireball'
            },
            {
                id: 'pet_002',
                name: '冰霜兔',
                rarity: 'R',
                element: 'WATER',
                attack: 80,
                defense: 60,
                hp: 350,
                skillId: 'skill_ice_trap'
            },
            {
                id: 'pet_003',
                name: '雷霆熊',
                rarity: 'SR',
                element: 'FIRE',
                attack: 150,
                defense: 80,
                hp: 500,
                skillId: 'skill_thunder'
            },
            {
                id: 'pet_004',
                name: '治愈狐',
                rarity: 'SR',
                element: 'LIGHT',
                attack: 60,
                defense: 70,
                hp: 400,
                skillId: 'skill_heal'
            },
            {
                id: 'pet_005',
                name: '暗影龙',
                rarity: 'SSR',
                element: 'DARK',
                attack: 200,
                defense: 100,
                hp: 600,
                skillId: 'skill_shadow'
            }
        ];
        
        configs.forEach(config => {
            this.petConfigs.set(config.id, config);
        });
    }
    
    /**
     * 抽卡获取萌宠
     */
    gachaDraw(times: number = 1): PetData[] {
        const results: PetData[] = [];
        
        for (let i = 0; i < times; i++) {
            const rarity = this.calculateRarity();
            const petsOfRarity = Array.from(this.petConfigs.values())
                .filter(config => config.rarity === rarity);
            
            if (petsOfRarity.length > 0) {
                const randomPet = petsOfRarity[Math.floor(Math.random() * petsOfRarity.length)];
                const petData = new PetData(randomPet);
                this.ownedPets.push(petData);
                results.push(petData);
            }
        }
        
        return results;
    }
    
    /**
     * 计算抽卡稀有度
     */
    private calculateRarity(): string {
        const random = Math.random();
        let cumulative = 0;
        
        const rates = GameConfig.PET.RARITY;
        cumulative += rates.SSR.rate;
        if (random < cumulative) return 'SSR';
        
        cumulative += rates.SR.rate;
        if (random < cumulative) return 'SR';
        
        cumulative += rates.R.rate;
        if (random < cumulative) return 'R';
        
        return 'N';
    }
    
    /**
     * 设置出战阵容
     */
    setBattleTeam(petIds: string[]): boolean {
        if (petIds.length > GameConfig.PET.MAX_TEAM_SIZE) {
            console.warn('出战数量超过上限');
            return false;
        }
        
        this.battleTeam = petIds.map(id => 
            this.ownedPets.find(pet => pet.id === id)
        ).filter(pet => pet !== undefined);
        
        return true;
    }
    
    /**
     * 获取出战阵容
     */
    getBattleTeam(): PetData[] {
        return this.battleTeam;
    }
    
    /**
     * 萌宠升级
     */
    upgradePet(petId: string): boolean {
        const pet = this.ownedPets.find(p => p.id === petId);
        if (!pet || pet.level >= GameConfig.PET.MAX_LEVEL) {
            return false;
        }
        
        // 计算所需经验
        const requiredExp = this.calculateRequiredExp(pet.level);
        
        if (pet.exp >= requiredExp) {
            pet.exp -= requiredExp;
            pet.level++;
            
            // 提升属性
            pet.attack = Math.floor(pet.attack * 1.1);
            pet.defense = Math.floor(pet.defense * 1.1);
            pet.hp = Math.floor(pet.hp * 1.1);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * 计算升级所需经验
     */
    private calculateRequiredExp(level: number): number {
        return Math.floor(100 * Math.pow(1.2, level - 1));
    }
    
    /**
     * 获取所有拥有的萌宠
     */
    getOwnedPets(): PetData[] {
        return this.ownedPets;
    }
    
    /**
     * 检查是否拥有某萌宠
     */
    hasPet(petId: string): boolean {
        return this.ownedPets.some(pet => pet.id === petId);
    }
}