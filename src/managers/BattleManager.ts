/**
 * 战斗管理器
 * 负责战斗逻辑、波次管理、技能选择等
 */

import { GameConfig, SKILL_DATA, PET_DATA } from '../GameConfig';
import { Pet } from './PetManager';

const { ccclass } = cc._decorator;

export interface BattleState {
    wave: number;           // 当前波数
    team: Pet[];            // 上阵队伍
    enemies: Enemy[];       // 敌人列表
    skills: string[];       // 已选技能
    isPaused: boolean;      // 是否暂停
    isFinished: boolean;    // 是否结束
    totalDamage: number;    // 总伤害
    battleTime: number;     // 战斗时间
}

export interface Enemy {
    id: string;
    name: string;
    atk: number;
    hp: number;
    maxHp: number;
    element: string;
    level: number;
}

export interface SkillEffect {
    id: string;
    name: string;
    type: 'buff' | 'element' | 'special' | 'heal';
    effect: any;
}

@ccclass
export class BattleManager extends cc.Component {
    
    private _state: BattleState = null;
    private _battleCallback: (event: string, data: any) => void = null;
    private _skillEffects: Map<string, any> = new Map();
    private _petSkillCooldowns: Map<string, number> = new Map();
    
    onLoad() {
        console.log('[BattleManager] 初始化');
        this._initSkillEffects();
    }
    
    /**
     * 初始化技能效果映射
     */
    private _initSkillEffects(): void {
        // 萌宠特殊技能效果
        this._skillEffects.set('火球术', { type: 'damage', multiplier: 1.2, element: 'FIRE' });
        this._skillEffects.set('水枪', { type: 'damage', multiplier: 1.0, element: 'WATER', heal: 0.05 });
        this._skillEffects.set('飞叶快刀', { type: 'damage', multiplier: 1.1, element: 'GRASS', critBonus: 0.1 });
        this._skillEffects.set('电击', { type: 'damage', multiplier: 1.3, element: 'FIRE', chain: true });
        this._skillEffects.set('泡沫', { type: 'defense', multiplier: 1.0, element: 'WATER', defenseBonus: 0.2 });
        this._skillEffects.set('火焰喷射', { type: 'damage', multiplier: 1.5, element: 'FIRE', burn: true });
        this._skillEffects.set('冰冻陷阱', { type: 'control', multiplier: 1.0, element: 'WATER', freeze: true });
        this._skillEffects.set('闪电链', { type: 'damage', multiplier: 1.4, element: 'FIRE', chain: true, chainCount: 3 });
        this._skillEffects.set('群体治疗', { type: 'heal', multiplier: 0.3, element: 'LIGHT', aoe: true });
        this._skillEffects.set('暗影突袭', { type: 'damage', multiplier: 1.6, element: 'DARK', critBonus: 0.2 });
        this._skillEffects.set('涅槃重生', { type: 'special', multiplier: 2.0, element: 'FIRE', revive: true });
        this._skillEffects.set('绝对零度', { type: 'damage', multiplier: 1.8, element: 'WATER', freeze: true, aoe: true });
        this._skillEffects.set('雷霆万钧', { type: 'damage', multiplier: 2.0, element: 'FIRE', stun: true });
        this._skillEffects.set('圣光普照', { type: 'heal', multiplier: 0.5, element: 'LIGHT', aoe: true, buff: true });
        this._skillEffects.set('黑暗吞噬', { type: 'damage', multiplier: 2.2, element: 'DARK', lifesteal: 0.3 });
        this._skillEffects.set('神圣审判', { type: 'damage', multiplier: 2.5, element: 'LIGHT', holy: true });
        this._skillEffects.set('毁灭黑洞', { type: 'damage', multiplier: 2.8, element: 'DARK', aoe: true, suck: true });
        this._skillEffects.set('元素风暴', { type: 'damage', multiplier: 2.0, element: 'FIRE', randomElement: true });
        this._skillEffects.set('时空扭曲', { type: 'special', multiplier: 1.0, element: 'LIGHT', timeStop: true });
        this._skillEffects.set('创世之光', { type: 'damage', multiplier: 3.0, element: 'LIGHT', aoe: true, instantKill: 0.1 });
    }
    
    /**
     * 开始战斗
     */
    public startBattle(team: Pet[], callback?: (event: string, data: any) => void): void {
        this._battleCallback = callback || (() => {});
        
        this._state = {
            wave: 1,
            team: team.map(p => ({ ...p, maxHp: p.hp })),  // 深拷贝并添加maxHp
            enemies: [],
            skills: [],
            isPaused: false,
            isFinished: false,
            totalDamage: 0,
            battleTime: 0
        };
        
        // 生成第一波敌人
        this._spawnEnemies();
        
        console.log('[BattleManager] 战斗开始，队伍:', team.map(p => p.name));
        this._battleCallback('battle_start', { wave: 1, team: team.map(p => ({ name: p.name, hp: p.hp, atk: p.atk })) });
        
        // 开始战斗循环
        this.schedule(this._battleLoop, 1);
    }
    
    /**
     * 战斗主循环
     */
    private _battleLoop = (): void => {
        if (!this._state || this._state.isPaused || this._state.isFinished) return;
        
        this._state.battleTime++;
        
        // 1. 我方攻击
        this._teamAttack();
        
        // 2. 检查敌人是否全灭
        if (this._state.enemies.every(e => e.hp <= 0)) {
            this._onWaveClear();
            return;
        }
        
        // 3. 敌人攻击
        this._enemyAttack();
        
        // 4. 检查我方是否全灭
        if (this._state.team.every(p => p.hp <= 0)) {
            this._onBattleEnd(false);
            return;
        }
        
        // 发送战斗更新事件
        this._battleCallback('battle_update', {
            team: this._state.team,
            enemies: this._state.enemies,
            time: this._state.battleTime
        });
    };
    
    /**
     * 我方攻击
     */
    private _teamAttack(): void {
        for (const pet of this._state.team) {
            if (pet.hp <= 0) continue;
            
            // 寻找存活的敌人
            const target = this._state.enemies.find(e => e.hp > 0);
            if (!target) break;
            
            // 计算基础伤害
            let damage = pet.atk;
            
            // 属性克制
            const elementBonus = this._checkElementBonus(pet.element, target.element);
            damage *= elementBonus;
            
            // 应用萌宠技能效果
            const skillEffect = this._skillEffects.get(pet.skill);
            if (skillEffect) {
                damage = this._applyPetSkill(pet, target, damage, skillEffect);
            }
            
            // 应用已选技能buff
            damage = this._applySkillBuffs(pet, damage);
            
            // 暴击计算
            const isCrit = Math.random() < 0.15;
            if (isCrit) {
                damage *= 1.5;
            }
            
            damage = Math.floor(damage);
            
            // 应用伤害
            target.hp = Math.max(0, target.hp - damage);
            this._state.totalDamage += damage;
            
            this._battleCallback('pet_attack', {
                pet: pet.name,
                target: target.name,
                damage: damage,
                isCrit: isCrit,
                remainingHp: target.hp,
                skill: pet.skill
            });
            
            // 处理连锁攻击
            if (skillEffect?.chain) {
                this._handleChainAttack(pet, target, damage, skillEffect);
            }
        }
    }
    
    /**
     * 应用萌宠技能效果
     */
    private _applyPetSkill(pet: Pet, target: Enemy, baseDamage: number, effect: any): number {
        let damage = baseDamage * (effect.multiplier || 1);
        
        // 吸血效果
        if (effect.lifesteal) {
            const healAmount = Math.floor(damage * effect.lifesteal);
            pet.hp = Math.min(pet.hp + healAmount, pet.maxHp || pet.hp * 1.5);
            this._battleCallback('pet_heal', { pet: pet.name, amount: healAmount });
        }
        
        // 治疗技能
        if (effect.type === 'heal' && effect.aoe) {
            const healAmount = Math.floor(pet.atk * effect.multiplier);
            for (const teamPet of this._state.team) {
                if (teamPet.hp > 0) {
                    teamPet.hp = Math.min(teamPet.hp + healAmount, teamPet.maxHp || teamPet.hp * 1.5);
                }
            }
            this._battleCallback('team_heal', { amount: healAmount });
            return 0; // 治疗技能不造成伤害
        }
        
        return damage;
    }
    
    /**
     * 处理连锁攻击
     */
    private _handleChainAttack(pet: Pet, primaryTarget: Enemy, baseDamage: number, effect: any): void {
        const chainCount = effect.chainCount || 2;
        const otherEnemies = this._state.enemies.filter(e => e.hp > 0 && e.id !== primaryTarget.id);
        
        for (let i = 0; i < Math.min(chainCount, otherEnemies.length); i++) {
            const chainTarget = otherEnemies[i];
            const chainDamage = Math.floor(baseDamage * 0.6); // 连锁伤害递减
            chainTarget.hp = Math.max(0, chainTarget.hp - chainDamage);
            
            this._battleCallback('chain_attack', {
                pet: pet.name,
                target: chainTarget.name,
                damage: chainDamage,
                remainingHp: chainTarget.hp
            });
        }
    }
    
    /**
     * 应用技能buff
     */
    private _applySkillBuffs(pet: Pet, damage: number): number {
        for (const skillId of this._state.skills) {
            const skill = SKILL_DATA.find(s => s.id === skillId);
            if (!skill) continue;
            
            if (skill.effect.atk) {
                damage *= (1 + skill.effect.atk);
            }
        }
        return damage;
    }
    
    /**
     * 敌人攻击
     */
    private _enemyAttack(): void {
        for (const enemy of this._state.enemies) {
            if (enemy.hp <= 0) continue;
            
            // 寻找存活的我方萌宠
            const target = this._state.team.find(p => p.hp > 0);
            if (!target) break;
            
            // 计算伤害
            let damage = enemy.atk;
            
            // 应用防御buff
            for (const skillId of this._state.skills) {
                const skill = SKILL_DATA.find(s => s.id === skillId);
                if (skill?.effect.def) {
                    damage *= (1 - skill.effect.def);
                }
            }
            
            damage = Math.floor(damage);
            
            // 应用伤害
            target.hp = Math.max(0, target.hp - damage);
            
            this._battleCallback('enemy_attack', {
                enemy: enemy.name,
                target: target.name,
                damage: damage,
                remainingHp: target.hp
            });
        }
    }
    
    /**
     * 生成敌人
     */
    private _spawnEnemies(): void {
        const wave = this._state.wave;
        const enemyCount = Math.min(3 + Math.floor(wave / 5), 6);
        
        this._state.enemies = [];
        
        // 根据波数增加敌人强度
        const levelMultiplier = 1 + (wave - 1) * 0.1;
        
        for (let i = 0; i < enemyCount; i++) {
            const isElite = wave % 10 === 0 && i === 0; // 每10波的BOSS
            const enemy: Enemy = {
                id: `enemy_${wave}_${i}`,
                name: isElite ? `精英怪物 Lv.${wave}` : `怪物 Lv.${wave}`,
                atk: Math.floor((5 + wave * 2) * levelMultiplier * (isElite ? 1.5 : 1)),
                hp: Math.floor((20 + wave * 10) * levelMultiplier * (isElite ? 2 : 1)),
                maxHp: Math.floor((20 + wave * 10) * levelMultiplier * (isElite ? 2 : 1)),
                element: this._getRandomElement(),
                level: wave
            };
            this._state.enemies.push(enemy);
        }
        
        this._battleCallback('enemies_spawn', { 
            enemies: this._state.enemies,
            wave: wave,
            isBossWave: wave % 10 === 0
        });
    }
    
    /**
     * 波次清理
     */
    private _onWaveClear(): void {
        console.log(`[BattleManager] 第${this._state.wave}波清理完成`);
        
        // 恢复部分生命值
        const healPercent = 0.1;
        for (const pet of this._state.team) {
            if (pet.hp > 0) {
                const maxHp = pet.maxHp || pet.hp * 1.5;
                pet.hp = Math.min(pet.hp + maxHp * healPercent, maxHp);
            }
        }
        
        this._battleCallback('wave_clear', { 
            wave: this._state.wave,
            healPercent: healPercent
        });
        
        // 检查是否达到技能选择波次
        if (this._state.wave % GameConfig.BATTLE_WAVE_INTERVAL === 0) {
            this._showSkillSelection();
            return;
        }
        
        // 进入下一波
        this._nextWave();
    }
    
    /**
     * 显示技能选择
     */
    private _showSkillSelection(): void {
        this._state.isPaused = true;
        
        // 随机3个技能供选择，优先推荐适合当前队伍的技能
        const options = this._getRecommendedSkills(3);
        
        this._battleCallback('skill_select', { options, wave: this._state.wave });
    }
    
    /**
     * 获取推荐的技能
     */
    private _getRecommendedSkills(count: number): any[] {
        // 分析队伍构成
        const teamElements = this._state.team.map(p => p.element);
        const shuffled = [...SKILL_DATA].sort(() => Math.random() - 0.5);
        
        // 优先推荐与队伍属性匹配的技能
        const recommended = [];
        const others = [];
        
        for (const skill of shuffled) {
            let isRecommended = false;
            
            // 检查是否与队伍属性匹配
            if (skill.effect.fire && teamElements.includes('FIRE')) isRecommended = true;
            if (skill.effect.water && teamElements.includes('WATER')) isRecommended = true;
            if (skill.effect.grass && teamElements.includes('GRASS')) isRecommended = true;
            if (skill.effect.light && teamElements.includes('LIGHT')) isRecommended = true;
            if (skill.effect.dark && teamElements.includes('DARK')) isRecommended = true;
            
            if (isRecommended && recommended.length < count) {
                recommended.push(skill);
            } else {
                others.push(skill);
            }
        }
        
        // 补足数量
        while (recommended.length < count && others.length > 0) {
            recommended.push(others.shift());
        }
        
        return recommended.slice(0, count);
    }
    
    /**
     * 选择技能
     */
    public selectSkill(skillId: string): void {
        this._state.skills.push(skillId);
        
        // 应用技能效果
        this._applySkill(skillId);
        
        this._state.isPaused = false;
        
        console.log(`[BattleManager] 选择技能: ${skillId}`);
        this._battleCallback('skill_selected', { skillId });
        this._nextWave();
    }
    
    /**
     * 应用技能效果
     */
    private _applySkill(skillId: string): void {
        const skill = SKILL_DATA.find(s => s.id === skillId);
        if (!skill) return;
        
        // 应用buff效果
        for (const pet of this._state.team) {
            if (skill.effect.atk) {
                pet.atk = Math.floor(pet.atk * (1 + skill.effect.atk));
            }
            if (skill.effect.hp) {
                const maxHp = pet.maxHp || pet.hp;
                pet.maxHp = Math.floor(maxHp * (1 + skill.effect.hp));
                pet.hp = Math.floor(pet.hp * (1 + skill.effect.hp));
            }
        }
    }
    
    /**
     * 进入下一波
     */
    private _nextWave(): void {
        this._state.wave++;
        
        if (this._state.wave > GameConfig.MAX_WAVES) {
            this._onBattleEnd(true);
            return;
        }
        
        this._spawnEnemies();
        this._battleCallback('wave_start', { wave: this._state.wave });
    }
    
    /**
     * 战斗结束
     */
    private _onBattleEnd(isVictory: boolean): void {
        this._state.isFinished = true;
        this.unschedule(this._battleLoop);
        
        console.log(`[BattleManager] 战斗结束，${isVictory ? '胜利' : '失败'}`);
        
        // 计算奖励
        const rewards = this._calculateRewards(isVictory);
        
        this._battleCallback('battle_end', {
            victory: isVictory,
            wave: this._state.wave,
            totalDamage: this._state.totalDamage,
            battleTime: this._state.battleTime,
            rewards
        });
    }
    
    /**
     * 计算奖励
     */
    private _calculateRewards(isVictory: boolean): any {
        const wave = this._state.wave;
        const isBossWave = wave % 10 === 0;
        
        return {
            gold: isVictory ? wave * 50 : wave * 10,
            exp: isVictory ? wave * 20 : wave * 5,
            items: isVictory && isBossWave ? ['抽卡券', '高级经验书'] : 
                   isVictory && wave % 5 === 0 ? ['抽卡券'] : [],
            bonus: isBossWave ? { gold: wave * 20, exp: wave * 10 } : null
        };
    }
    
    /**
     * 暂停/继续战斗
     */
    public togglePause(): void {
        if (!this._state) return;
        this._state.isPaused = !this._state.isPaused;
        this._battleCallback('battle_pause', { paused: this._state.isPaused });
    }
    
    /**
     * 结束战斗
     */
    public endBattle(): void {
        if (!this._state) return;
        this._onBattleEnd(false);
    }
    
    /**
     * 获取战斗状态
     */
    public getState(): BattleState {
        return this._state;
    }
    
    /**
     * 检查属性克制
     */
    private _checkElementBonus(atkElement: string, defElement: string): number {
        const elements = GameConfig.ELEMENTS;
        
        if (elements[atkElement]?.strong === defElement) {
            return 1.5;  // 克制
        }
        if (elements[atkElement]?.weak === defElement) {
            return 0.75;  // 被克制
        }
        return 1.0;
    }
    
    /**
     * 获取随机属性
     */
    private _getRandomElement(): string {
        const elements = ['FIRE', 'WATER', 'GRASS', 'LIGHT', 'DARK'];
        return elements[Math.floor(Math.random() * elements.length)];
    }
    
    /**
     * 获取随机技能
     */
    private _getRandomSkills(count: number): any[] {
        const shuffled = [...SKILL_DATA].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    
    /**
     * 获取萌宠技能效果
     */
    public getPetSkillEffect(skillName: string): any {
        return this._skillEffects.get(skillName);
    }
    
    /**
     * 检查是否有复活技能
     */
    public checkRevive(pet: Pet): boolean {
        const skillEffect = this._skillEffects.get(pet.skill);
        return skillEffect?.revive === true;
    }
}