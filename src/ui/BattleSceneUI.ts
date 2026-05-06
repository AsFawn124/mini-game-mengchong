/**
 * 战斗场景UI
 * 战斗界面，包含战斗展示、技能选择等
 */

import GameMain from '../GameMain';
import { Pet } from '../managers/PetManager';
import { BattleState, Enemy } from '../managers/BattleManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleSceneUI extends cc.Component {
    
    // UI组件引用
    @property(cc.Label)
    waveLabel: cc.Label = null;
    
    @property(cc.Node)
    teamContainer: cc.Node = null;
    
    @property(cc.Node)
    enemyContainer: cc.Node = null;
    
    @property(cc.Node)
    skillSelectPanel: cc.Node = null;
    
    @property(cc.Node)
    pauseButton: cc.Node = null;
    
    @property(cc.Node)
    resultPanel: cc.Node = null;
    
    @property(cc.Label)
    resultTitle: cc.Label = null;
    
    @property(cc.Label)
    resultWaveLabel: cc.Label = null;
    
    @property(cc.Node)
    continueButton: cc.Node = null;
    
    @property(cc.Node)
    exitButton: cc.Node = null;
    
    // 战斗状态
    private _isPaused: boolean = false;
    private _isFinished: boolean = false;
    
    onLoad() {
        console.log('[BattleSceneUI] 战斗场景加载');
        this._initUI();
    }
    
    start() {
        this._startBattle();
    }
    
    /**
     * 初始化UI
     */
    private _initUI(): void {
        // 绑定按钮事件
        this.pauseButton.on(cc.Node.EventType.TOUCH_END, this._onPauseClick, this);
        this.continueButton.on(cc.Node.EventType.TOUCH_END, this._onContinueClick, this);
        this.exitButton.on(cc.Node.EventType.TOUCH_END, this._onExitClick, this);
        
        // 隐藏结果面板
        this.resultPanel.active = false;
        this.skillSelectPanel.active = false;
    }
    
    /**
     * 开始战斗
     */
    private _startBattle(): void {
        if (!GameMain.instance) return;
        
        // 播放战斗音效
        GameMain.instance.audioManager.playBattleStart();
        
        // 获取上阵队伍
        const team = GameMain.instance.petManager.getTeam();
        
        // 显示队伍
        this._showTeam(team);
        
        // 开始战斗逻辑
        GameMain.instance.battleManager.startBattle(team, (event, data) => {
            this._onBattleEvent(event, data);
        });
        
        // 更新波数显示
        this._updateWaveDisplay(1);
    }
    
    /**
     * 显示我方队伍
     */
    private _showTeam(team: Pet[]): void {
        this.teamContainer.removeAllChildren();
        
        team.forEach((pet, index) => {
            const node = this._createPetBattleNode(pet, index, true);
            this.teamContainer.addChild(node);
        });
    }
    
    /**
     * 显示敌人
     */
    private _showEnemies(enemies: Enemy[]): void {
        this.enemyContainer.removeAllChildren();
        
        enemies.forEach((enemy, index) => {
            const node = this._createEnemyNode(enemy, index);
            this.enemyContainer.addChild(node);
        });
    }
    
    /**
     * 创建萌宠战斗节点
     */
    private _createPetBattleNode(pet: Pet, index: number, isPlayer: boolean): cc.Node {
        const node = new cc.Node(`Pet_${pet.id}`);
        const xPos = isPlayer ? -300 : 300;
        const yPos = (index - 1) * 150;
        node.setPosition(xPos, yPos);
        
        // 萌宠形象
        const spriteNode = new cc.Node('Sprite');
        const sprite = spriteNode.addComponent(cc.Sprite);
        // TODO: 设置萌宠图片
        node.addChild(spriteNode);
        
        // 血条
        const hpBar = this._createHPBar(pet.hp, pet.hp);
        hpBar.name = 'HPBar';
        hpBar.setPosition(0, -70);
        node.addChild(hpBar);
        
        // 名称
        const nameNode = new cc.Node('Name');
        const nameLabel = nameNode.addComponent(cc.Label);
        nameLabel.string = pet.name;
        nameLabel.fontSize = 20;
        nameNode.setPosition(0, 80);
        node.addChild(nameNode);
        
        return node;
    }
    
    /**
     * 创建敌人节点
     */
    private _createEnemyNode(enemy: Enemy, index: number): cc.Node {
        const node = new cc.Node(`Enemy_${enemy.id}`);
        const yPos = (index - 1) * 120;
        node.setPosition(300, yPos);
        
        // 敌人形象
        const spriteNode = new cc.Node('Sprite');
        const sprite = spriteNode.addComponent(cc.Sprite);
        // TODO: 设置敌人图片
        node.addChild(spriteNode);
        
        // 血条
        const hpBar = this._createHPBar(enemy.hp, enemy.maxHp);
        hpBar.name = 'HPBar';
        hpBar.setPosition(0, -60);
        node.addChild(hpBar);
        
        // 名称
        const nameNode = new cc.Node('Name');
        const nameLabel = nameNode.addComponent(cc.Label);
        nameLabel.string = enemy.name;
        nameLabel.fontSize = 18;
        nameNode.setPosition(0, 70);
        node.addChild(nameNode);
        
        return node;
    }
    
    /**
     * 创建血条
     */
    private _createHPBar(current: number, max: number): cc.Node {
        const container = new cc.Node('HPBarContainer');
        container.setContentSize(100, 10);
        
        // 背景
        const bg = new cc.Node('BG');
        bg.setContentSize(100, 10);
        const bgSprite = bg.addComponent(cc.Sprite);
        // TODO: 设置血条背景
        container.addChild(bg);
        
        // 血量
        const fill = new cc.Node('Fill');
        fill.setContentSize(100 * (current / max), 10);
        fill.anchorX = 0;
        fill.setPosition(-50, 0);
        const fillSprite = fill.addComponent(cc.Sprite);
        // TODO: 设置血量颜色
        container.addChild(fill);
        
        return container;
    }
    
    /**
     * 战斗事件回调
     */
    private _onBattleEvent(event: string, data: any): void {
        switch (event) {
            case 'battle_start':
                console.log('[BattleSceneUI] 战斗开始');
                break;
                
            case 'enemies_spawn':
                this._showEnemies(data.enemies);
                break;
                
            case 'wave_start':
                this._updateWaveDisplay(data.wave);
                break;
                
            case 'wave_clear':
                this._onWaveClear();
                break;
                
            case 'skill_select':
                this._showSkillSelection(data.options);
                break;
                
            case 'pet_attack':
                this._onPetAttack(data);
                break;
                
            case 'enemy_attack':
                this._onEnemyAttack(data);
                break;
                
            case 'battle_update':
                this._updateBattleDisplay(data);
                break;
                
            case 'battle_end':
                this._onBattleEnd(data);
                break;
                
            case 'battle_pause':
                this._isPaused = data.paused;
                break;
        }
    }
    
    /**
     * 更新波数显示
     */
    private _updateWaveDisplay(wave: number): void {
        this.waveLabel.string = `第 ${wave} 波`;
    }
    
    /**
     * 波次清理
     */
    private _onWaveClear(): void {
        // 显示波次清理特效
        console.log('[BattleSceneUI] 波次清理');
    }
    
    /**
     * 显示技能选择
     */
    private _showSkillSelection(options: any[]): void {
        this.skillSelectPanel.active = true;
        
        // 清空旧选项
        const content = this.skillSelectPanel.getChildByName('Content');
        if (content) {
            content.removeAllChildren();
            
            // 创建技能选项
            options.forEach((skill, index) => {
                const btn = this._createSkillButton(skill, index);
                content.addChild(btn);
            });
        }
    }
    
    /**
     * 创建技能按钮
     */
    private _createSkillButton(skill: any, index: number): cc.Node {
        const btn = new cc.Node('SkillBtn');
        btn.setPosition((index - 1) * 200, 0);
        
        // 背景
        const bg = btn.addComponent(cc.Sprite);
        // TODO: 设置按钮背景
        
        // 技能名称
        const nameNode = new cc.Node('Name');
        const nameLabel = nameNode.addComponent(cc.Label);
        nameLabel.string = skill.name;
        nameLabel.fontSize = 24;
        nameNode.setPosition(0, 20);
        btn.addChild(nameNode);
        
        // 点击事件
        btn.on(cc.Node.EventType.TOUCH_END, () => {
            this._onSkillSelected(skill.id);
        });
        
        return btn;
    }
    
    /**
     * 选择技能
     */
    private _onSkillSelected(skillId: string): void {
        this.skillSelectPanel.active = false;
        
        if (GameMain.instance) {
            GameMain.instance.battleManager.selectSkill(skillId);
        }
    }
    
    /**
     * 萌宠攻击
     */
    private _onPetAttack(data: any): void {
        console.log(`[BattleSceneUI] ${data.pet} 攻击 ${data.target}，伤害 ${data.damage}`);
        
        // 播放攻击动画
        GameMain.instance?.audioManager.playAttack();
        
        // 更新敌人血条
        this._updateEnemyHP(data.target, data.remainingHp);
    }
    
    /**
     * 敌人攻击
     */
    private _onEnemyAttack(data: any): void {
        console.log(`[BattleSceneUI] ${data.enemy} 攻击 ${data.target}，伤害 ${data.damage}`);
        
        // 更新萌宠血条
        this._updatePetHP(data.target, data.remainingHp);
    }
    
    /**
     * 更新战斗显示
     */
    private _updateBattleDisplay(data: any): void {
        // 更新所有血条
        data.team.forEach((pet: Pet) => {
            this._updatePetHP(pet.name, pet.hp);
        });
        
        data.enemies.forEach((enemy: Enemy) => {
            this._updateEnemyHP(enemy.name, enemy.hp);
        });
    }
    
    /**
     * 更新萌宠血条
     */
    private _updatePetHP(petName: string, hp: number): void {
        const petNode = this.teamContainer.getChildByName(`Pet_${petName}`);
        if (petNode) {
            const hpBar = petNode.getChildByName('HPBar');
            if (hpBar) {
                // 更新血条显示
                // TODO: 实现血条更新动画
            }
        }
    }
    
    /**
     * 更新敌人血条
     */
    private _updateEnemyHP(enemyName: string, hp: number): void {
        const enemyNode = this.enemyContainer.getChildByName(`Enemy_${enemyName}`);
        if (enemyNode) {
            const hpBar = enemyNode.getChildByName('HPBar');
            if (hpBar) {
                // 更新血条显示
            }
        }
    }
    
    /**
     * 战斗结束
     */
    private _onBattleEnd(data: any): void {
        this._isFinished = true;
        
        // 显示结果面板
        this.resultPanel.active = true;
        
        if (data.victory) {
            this.resultTitle.string = '胜利！';
            this.resultTitle.color = cc.Color.GREEN;
            GameMain.instance?.audioManager.playVictory();
        } else {
            this.resultTitle.string = '失败';
            this.resultTitle.color = cc.Color.RED;
            GameMain.instance?.audioManager.playDefeat();
        }
        
        this.resultWaveLabel.string = `坚持到第 ${data.wave} 波`;
        
        // 提交分数
        if (GameMain.instance?.cloudManager) {
            GameMain.instance.cloudManager.submitScore(data.rewards.gold, data.wave);
        }
    }
    
    /**
     * 点击暂停按钮
     */
    private _onPauseClick(): void {
        if (GameMain.instance) {
            GameMain.instance.battleManager.togglePause();
            GameMain.instance.audioManager.playButtonClick();
        }
    }
    
    /**
     * 点击继续按钮
     */
    private _onContinueClick(): void {
        if (this._isFinished) {
            // 重新开始
            this.resultPanel.active = false;
            this._startBattle();
        }
    }
    
    /**
     * 点击退出按钮
     */
    private _onExitClick(): void {
        // 结束战斗
        if (GameMain.instance) {
            GameMain.instance.battleManager.endBattle();
        }
        
        // 返回主场景
        GameMain.instance?.enterScene('MainScene');
    }
}
