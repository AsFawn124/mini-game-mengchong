import { _decorator, Component, Node, Label, ProgressBar, instantiate, Prefab } from 'cc';
import { PetManager, PetData } from '../managers/PetManager';
import { GameConfig, GameEvent } from '../config/GameConfig';

const { ccclass, property } = _decorator;

/**
 * 战斗管理器
 * 负责战斗逻辑、波数控制、技能选择等
 */
@ccclass('BattleManager')
export class BattleManager extends Component {
    
    // 单例
    private static _instance: BattleManager = null;
    public static get instance(): BattleManager {
        return BattleManager._instance;
    }
    
    @property(Label)
    waveLabel: Label = null;           // 波数显示
    
    @property(ProgressBar)
    enemyHpBar: ProgressBar = null;    // 敌人血条
    
    @property(Node)
    petContainer: Node = null;         // 萌宠容器
    
    @property(Node)
    skillSelectPanel: Node = null;     // 技能选择面板
    
    // 战斗状态
    private isBattling: boolean = false;
    private currentWave: number = 0;
    private enemyHp: number = 100;
    private enemyMaxHp: number = 100;
    
    // 战斗数据
    private battlePets: PetData[] = [];
    private selectedSkills: string[] = [];
    
    // 自动攻击定时器
    private attackTimer: number = 0;
    
    onLoad() {
        if (BattleManager._instance === null) {
            BattleManager._instance = this;
        }
    }
    
    /**
     * 开始战斗
     */
    startBattle(): void {
        this.battlePets = PetManager.instance.getBattleTeam();
        
        if (this.battlePets.length === 0) {
            console.warn('请先设置出战阵容');
            return;
        }
        
        this.isBattling = true;
        this.currentWave = 1;
        this.selectedSkills = [];
        
        this.spawnEnemy();
        this.updateWaveUI();
        
        // 开始自动战斗循环
        this.schedule(this.battleUpdate, GameConfig.BATTLE.AUTO_ATTACK_INTERVAL);
        
        console.log('战斗开始！');
    }
    
    /**
     * 战斗更新（每帧）
     */
    private battleUpdate(dt: number): void {
        if (!this.isBattling) return;
        
        // 萌宠自动攻击
        this.petAutoAttack();
        
        // 检查敌人是否死亡
        if (this.enemyHp <= 0) {
            this.onEnemyDefeated();
        }
    }
    
    /**
     * 萌宠自动攻击
     */
    private petAutoAttack(): void {
        let totalDamage = 0;
        
        this.battlePets.forEach(pet => {
            // 基础伤害
            let damage = pet.attack;
            
            // 应用技能加成
            this.selectedSkills.forEach(skillId => {
                damage = this.applySkillEffect(skillId, damage, pet);
            });
            
            totalDamage += damage;
        });
        
        // 扣除敌人血量
        this.enemyHp -= totalDamage;
        this.updateEnemyHpUI();
    }
    
    /**
     * 应用技能效果
     */
    private applySkillEffect(skillId: string, baseDamage: number, pet: PetData): number {
        // 根据技能ID计算加成
        const skillEffects: { [key: string]: number } = {
            'skill_fireball': 1.5,      // 火球术：伤害+50%
            'skill_ice_trap': 1.3,      // 冰冻陷阱：伤害+30%
            'skill_thunder': 1.8,       // 闪电链：伤害+80%
            'skill_heal': 0,            // 治愈：不增加伤害，恢复生命
            'skill_shadow': 2.0         // 暗影：伤害+100%
        };
        
        return Math.floor(baseDamage * (skillEffects[skillId] || 1));
    }
    
    /**
     * 敌人被击败
     */
    private onEnemyDefeated(): void {
        console.log(`第${this.currentWave}波通关！`);
        
        // 检查是否需要选择技能
        if (this.currentWave % GameConfig.BATTLE.SKILL_SELECT_INTERVAL === 0) {
            this.showSkillSelect();
        }
        
        // 进入下一波
        this.currentWave++;
        
        // 检查是否达到最大波数
        if (this.currentWave > GameConfig.BATTLE.MAX_WAVES) {
            this.endBattle(true);
            return;
        }
        
        this.spawnEnemy();
        this.updateWaveUI();
    }
    
    /**
     * 生成敌人
     */
    private spawnEnemy(): void {
        // 根据波数计算敌人强度
        const difficulty = 1 + (this.currentWave - 1) * 0.2;
        this.enemyMaxHp = Math.floor(100 * difficulty);
        this.enemyHp = this.enemyMaxHp;
        
        this.updateEnemyHpUI();
    }
    
    /**
     * 显示技能选择面板（Roguelike）
     */
    private showSkillSelect(): void {
        this.isBattling = false;
        this.unschedule(this.battleUpdate);
        
        // 随机3个技能供选择
        const skills = this.getRandomSkills(3);
        
        // 显示技能选择UI
        if (this.skillSelectPanel) {
            this.skillSelectPanel.active = true;
            // TODO: 设置技能按钮
        }
        
        console.log('请选择技能：', skills);
    }
    
    /**
     * 获取随机技能
     */
    private getRandomSkills(count: number): string[] {
        const allSkills = [
            'skill_fireball',
            'skill_ice_trap',
            'skill_thunder',
            'skill_heal',
            'skill_shadow',
            'skill_wind',
            'skill_earth',
            'skill_poison'
        ];
        
        const shuffled = allSkills.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    /**
     * 选择技能
     */
    selectSkill(skillId: string): void {
        this.selectedSkills.push(skillId);
        
        if (this.skillSelectPanel) {
            this.skillSelectPanel.active = false;
        }
        
        // 继续战斗
        this.isBattling = true;
        this.schedule(this.battleUpdate, GameConfig.BATTLE.AUTO_ATTACK_INTERVAL);
    }
    
    /**
     * 结束战斗
     */
    endBattle(isWin: boolean): void {
        this.isBattling = false;
        this.unschedule(this.battleUpdate);
        
        // 计算奖励
        const reward = this.calculateReward();
        
        // 显示结算界面
        console.log(`战斗结束！${isWin ? '胜利' : '失败'}`);
        console.log(`通过波数：${this.currentWave}`);
        console.log(`获得奖励：`, reward);
        
        // TODO: 显示结算UI
    }
    
    /**
     * 计算战斗奖励
     */
    private calculateReward(): any {
        const baseReward = {
            gold: this.currentWave * 10,
            exp: this.currentWave * 5,
            diamonds: Math.floor(this.currentWave / 10) * 5
        };
        
        // 根据波数加成
        if (this.currentWave >= 50) {
            baseReward.diamonds += 50;
        }
        
        return baseReward;
    }
    
    /**
     * 更新波数UI
     */
    private updateWaveUI(): void {
        if (this.waveLabel) {
            this.waveLabel.string = `第 ${this.currentWave} 波`;
        }
    }
    
    /**
     * 更新敌人血条UI
     */
    private updateEnemyHpUI(): void {
        if (this.enemyHpBar) {
            this.enemyHpBar.progress = Math.max(0, this.enemyHp / this.enemyMaxHp);
        }
    }
    
    /**
     * 暂停战斗
     */
    pauseBattle(): void {
        this.isBattling = false;
    }
    
    /**
     * 恢复战斗
     */
    resumeBattle(): void {
        this.isBattling = true;
    }
}