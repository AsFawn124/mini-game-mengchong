/**
 * 战斗管理器
 * 负责战斗逻辑、波次管理、技能选择等
 */

import { GameConfig, SKILL_DATA } from '../GameConfig';
import { Pet } from './PetManager';

const { ccclass } = cc._decorator;

export interface BattleState {
    wave: number;           // 当前波数
    team: Pet[];            // 上阵队伍
    enemies: Enemy[];       // 敌人列表
    skills: string[];       // 已选技能
    isPaused: boolean;      // 是否暂停
    isFinished: boolean;    // 是否结束
}

export interface Enemy {
    id: string;
    name: string;
    atk: number;
    hp: number;
    maxHp: number;
    element: string;
}

@ccclass
export class BattleManager extends cc.Component {
    
    private _state: BattleState = null;
    private _battleCallback: (event: string, data: any) => void = null;
    
    onLoad() {
        console.log('[BattleManager] 初始化');
    }
    
    /**
     * 开始战斗
     */
    public startBattle(team: Pet[], callback?: (event: string, data: any) => void): void {
        this._battleCallback = callback || (() => {});
        
        this._state = {
            wave: 1,
            team: team.map(p => ({ ...p })),  // 深拷贝
            enemies: [],
            skills: [],
            isPaused: false,
            isFinished: false
        };
        
        // 生成第一波敌人
        this._spawnEnemies();
        
        console.log('[BattleManager] 战斗开始，队伍:', team.map(p => p.name));
        this._battleCallback('battle_start', { wave: 1 });
        
        // 开始战斗循环
        this.schedule(this._battleLoop, 1);
    }
    
    /**
     * 战斗主循环
     */
    private _battleLoop = (): void => {
        if (!this._state || this._state.isPaused || this._state.isFinished) return;
        
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
            enemies: this._state.enemies
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
            
            // 计算伤害
            let damage = pet.atk;
            
            // 属性克制
            const elementBonus = this._checkElementBonus(pet.element, target.element);
            damage *= elementBonus;
            
            // 应用伤害
            target.hp = Math.max(0, target.hp - damage);
            
            this._battleCallback('pet_attack', {
                pet: pet.name,
                target: target.name,
                damage: damage,
                remainingHp: target.hp
            });
        }
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
        
        for (let i = 0; i < enemyCount; i++) {
            const enemy: Enemy = {
                id: `enemy_${wave}_${i}`,
                name: `怪物 Lv.${wave}`,
                atk: 5 + wave * 2,
                hp: 20 + wave * 10,
                maxHp: 20 + wave * 10,
                element: this._getRandomElement()
            };
            this._state.enemies.push(enemy);
        }
        
        this._battleCallback('enemies_spawn', { enemies: this._state.enemies });
    }
    
    /**
     * 波次清理
     */
    private _onWaveClear(): void {
        console.log(`[BattleManager] 第${this._state.wave}波清理完成`);
        
        // 恢复部分生命值
        for (const pet of this._state.team) {
            pet.hp = Math.min(pet.hp + pet.hp * 0.1, pet.hp);  // 恢复10%
        }
        
        this._battleCallback('wave_clear', { wave: this._state.wave });
        
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
        
        // 随机3个技能供选择
        const options = this._getRandomSkills(3);
        
        this._battleCallback('skill_select', { options });
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
        this._nextWave();
    }
    
    /**
     * 应用技能效果
     */
    private _applySkill(skillId: string): void {
        const skill = SKILL_DATA.find(s => s.id === skillId);
        if (!skill) return;
        
        // 应用buff效果（简化版）
        for (const pet of this._state.team) {
            if (skill.effect.atk) {
                pet.atk *= (1 + skill.effect.atk);
            }
            if (skill.effect.hp) {
                pet.hp *= (1 + skill.effect.hp);
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
            rewards
        });
    }
    
    /**
     * 计算奖励
     */
    private _calculateRewards(isVictory: boolean): any {
        const wave = this._state.wave;
        
        return {
            gold: isVictory ? wave * 50 : wave * 10,
            exp: isVictory ? wave * 20 : wave * 5,
            items: isVictory && wave % 10 === 0 ? ['抽卡券'] : []
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
        const elements = ['FIRE', 'WATER', 'GRASS'];
        return elements[Math.floor(Math.random() * elements.length)];
    }
    
    /**
     * 获取随机技能
     */
    private _getRandomSkills(count: number): any[] {
        const shuffled = [...SKILL_DATA].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
}
