/**
 * 萌宠管理器
 * 负责萌宠的获取、养成、合成等逻辑
 */

import { GameConfig, PET_DATA } from '../GameConfig';

const { ccclass } = cc._decorator;

export interface Pet {
    id: string;           // 实例ID
    petId: string;        // 萌宠模板ID
    name: string;
    rarity: string;       // N/R/SR/SSR
    element: string;      // 属性
    level: number;        // 等级
    exp: number;          // 经验
    atk: number;          // 攻击力
    hp: number;           // 生命值
    skill: string;        // 技能名
    count: number;        // 碎片数量
}

@ccclass
export class PetManager extends cc.Component {
    
    // 玩家拥有的萌宠列表
    private _ownedPets: Map<string, Pet> = new Map();
    
    // 当前上阵阵容
    private _team: string[] = [];
    
    onLoad() {
        console.log('[PetManager] 初始化');
    }
    
    /**
     * 抽卡
     * @param count 抽卡次数（1或10）
     * @returns 抽到的萌宠ID列表
     */
    public gacha(count: number = 1): string[] {
        const results: string[] = [];
        
        for (let i = 0; i < count; i++) {
            const petId = this._drawOne();
            results.push(petId);
            
            // 添加到背包
            this.addPet(petId);
        }
        
        console.log(`[PetManager] 抽卡${count}次，获得:`, results);
        return results;
    }
    
    /**
     * 单次抽取
     */
    private _drawOne(): string {
        const rand = Math.random();
        let cumulativeRate = 0;
        
        // 根据概率确定稀有度
        let targetRarity = 'N';
        for (const [rarity, config] of Object.entries(GameConfig.RARITY)) {
            cumulativeRate += config.rate;
            if (rand <= cumulativeRate) {
                targetRarity = rarity;
                break;
            }
        }
        
        // 从该稀有度中随机选择
        const petsOfRarity = PET_DATA.filter(p => p.rarity === targetRarity);
        const randomPet = petsOfRarity[Math.floor(Math.random() * petsOfRarity.length)];
        
        return randomPet.id;
    }
    
    /**
     * 添加萌宠到背包
     */
    public addPet(petId: string): Pet {
        const template = PET_DATA.find(p => p.id === petId);
        if (!template) {
            console.error(`[PetManager] 不存在的萌宠ID: ${petId}`);
            return null;
        }
        
        // 检查是否已拥有
        const existingPet = this._getPetByTemplateId(petId);
        if (existingPet) {
            // 已拥有，增加碎片
            existingPet.count++;
            console.log(`[PetManager] ${template.name} 碎片+1，当前: ${existingPet.count}`);
            return existingPet;
        }
        
        // 创建新萌宠
        const newPet: Pet = {
            id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            petId: template.id,
            name: template.name,
            rarity: template.rarity,
            element: template.element,
            level: 1,
            exp: 0,
            atk: template.atk,
            hp: template.hp,
            skill: template.skill,
            count: 1
        };
        
        this._ownedPets.set(newPet.id, newPet);
        console.log(`[PetManager] 获得新萌宠: ${newPet.name}`);
        
        return newPet;
    }
    
    /**
     * 升级萌宠
     */
    public levelUp(petId: string): boolean {
        const pet = this._ownedPets.get(petId);
        if (!pet) return false;
        
        const template = PET_DATA.find(p => p.id === pet.petId);
        const maxLevel = this._getMaxLevel(pet.rarity);
        
        if (pet.level >= maxLevel) {
            console.log(`[PetManager] ${pet.name} 已达到最大等级`);
            return false;
        }
        
        // 计算所需经验（简化版）
        const requiredExp = pet.level * 100;
        
        if (pet.exp >= requiredExp) {
            pet.exp -= requiredExp;
            pet.level++;
            
            // 提升属性
            pet.atk = Math.floor(template.atk * (1 + (pet.level - 1) * 0.1));
            pet.hp = Math.floor(template.hp * (1 + (pet.level - 1) * 0.1));
            
            console.log(`[PetManager] ${pet.name} 升级到 Lv.${pet.level}`);
            return true;
        }
        
        return false;
    }
    
    /**
     * 合成萌宠（3合1）
     */
    public merge(petIds: string[]): string | null {
        if (petIds.length !== 3) {
            console.error('[PetManager] 合成需要3只萌宠');
            return null;
        }
        
        // 获取萌宠
        const pets = petIds.map(id => this._ownedPets.get(id));
        if (pets.some(p => !p)) {
            console.error('[PetManager] 存在不存在的萌宠');
            return null;
        }
        
        // 检查是否是同一只萌宠
        const basePetId = pets[0].petId;
        if (!pets.every(p => p.petId === basePetId)) {
            console.error('[PetManager] 只能合成相同的萌宠');
            return null;
        }
        
        // 检查稀有度
        const rarity = pets[0].rarity;
        if (rarity === 'SSR') {
            console.error('[PetManager] SSR萌宠无法合成');
            return null;
        }
        
        // 移除材料
        petIds.forEach(id => this._ownedPets.delete(id));
        
        // 生成更高稀有度的萌宠
        const nextRarity = this._getNextRarity(rarity);
        const newPetId = this._getRandomPetByRarity(nextRarity);
        
        const newPet = this.addPet(newPetId);
        console.log(`[PetManager] 合成成功！获得 ${newPet.name}`);
        
        return newPet.id;
    }
    
    /**
     * 设置上阵阵容
     */
    public setTeam(petIds: string[]): boolean {
        if (petIds.length > GameConfig.MAX_TEAM_SIZE) {
            console.error(`[PetManager] 上阵数量不能超过${GameConfig.MAX_TEAM_SIZE}`);
            return false;
        }
        
        // 检查是否都拥有
        for (const id of petIds) {
            if (!this._ownedPets.has(id)) {
                console.error(`[PetManager] 未拥有的萌宠: ${id}`);
                return false;
            }
        }
        
        this._team = [...petIds];
        console.log('[PetManager] 阵容设置完成:', this._team);
        return true;
    }
    
    /**
     * 获取上阵阵容
     */
    public getTeam(): Pet[] {
        return this._team.map(id => this._ownedPets.get(id)).filter(p => p);
    }
    
    /**
     * 获取所有萌宠
     */
    public getAllPets(): Pet[] {
        return Array.from(this._ownedPets.values());
    }
    
    /**
     * 获取萌宠详情
     */
    public getPet(petId: string): Pet | null {
        return this._ownedPets.get(petId) || null;
    }
    
    /**
     * 根据模板ID获取萌宠
     */
    private _getPetByTemplateId(templateId: string): Pet | null {
        for (const pet of this._ownedPets.values()) {
            if (pet.petId === templateId) {
                return pet;
            }
        }
        return null;
    }
    
    /**
     * 获取最大等级
     */
    private _getMaxLevel(rarity: string): number {
        const maxLevels = { N: 30, R: 40, SR: 50, SSR: 60 };
        return maxLevels[rarity] || 30;
    }
    
    /**
     * 获取下一稀有度
     */
    private _getNextRarity(rarity: string): string {
        const nextMap = { N: 'R', R: 'SR', SR: 'SSR' };
        return nextMap[rarity] || rarity;
    }
    
    /**
     * 随机获取某稀有度的萌宠
     */
    private _getRandomPetByRarity(rarity: string): string {
        const pets = PET_DATA.filter(p => p.rarity === rarity);
        const randomPet = pets[Math.floor(Math.random() * pets.length)];
        return randomPet.id;
    }
}
