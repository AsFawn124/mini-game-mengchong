import { _decorator, Component, Node, Label, Button, director } from 'cc';
import { MergeSystem } from '../components/MergeSystem';
import { GameConfig } from '../config/GameConfig';

const { ccclass, property } = _decorator;

/**
 * 主场景UI控制器
 * 负责主界面的UI交互和显示
 */
@ccclass('MainSceneUI')
export class MainSceneUI extends Component {
    
    @property(Label)
    goldLabel: Label = null;           // 金币显示
    
    @property(Label)
    diamondLabel: Label = null;        // 钻石显示
    
    @property(Label)
    energyLabel: Label = null;         // 体力显示
    
    @property(Button)
    startBattleBtn: Button = null;     // 开始战斗按钮
    
    @property(Button)
    buyPetBtn: Button = null;          // 购买萌宠按钮
    
    @property(Button)
    gachaBtn: Button = null;           // 抽卡按钮
    
    @property(MergeSystem)
    mergeSystem: MergeSystem = null;   // 合成系统
    
    // 玩家资源
    private playerResources = {
        gold: 0,
        diamonds: GameConfig.ECONOMY.START_DIAMONDS,
        energy: GameConfig.ECONOMY.START_ENERGY
    };
    
    // 萌宠价格
    private readonly PET_PRICE = 100;
    
    onLoad() {
        this.bindEvents();
        this.updateResourceUI();
        this.startEnergyRecovery();
    }
    
    /**
     * 绑定按钮事件
     */
    private bindEvents(): void {
        if (this.startBattleBtn) {
            this.startBattleBtn.node.on(Button.EventType.CLICK, this.onStartBattle, this);
        }
        if (this.buyPetBtn) {
            this.buyPetBtn.node.on(Button.EventType.CLICK, this.onBuyPet, this);
        }
        if (this.gachaBtn) {
            this.gachaBtn.node.on(Button.EventType.CLICK, this.onGacha, this);
        }
        
        // 监听合成成功事件
        if (this.mergeSystem) {
            this.mergeSystem.node.on('merge-success', this.onMergeSuccess, this);
        }
    }
    
    /**
     * 开始战斗
     */
    private onStartBattle(): void {
        if (this.playerResources.energy < 5) {
            this.showMessage('体力不足！');
            return;
        }
        
        this.playerResources.energy -= 5;
        this.updateResourceUI();
        
        // 跳转到战斗场景
        director.loadScene('BattleScene');
    }
    
    /**
     * 购买萌宠
     */
    private onBuyPet(): void {
        if (this.playerResources.gold < this.PET_PRICE) {
            this.showMessage('金币不足！');
            return;
        }
        
        if (!this.mergeSystem || !this.mergeSystem.hasEmptyCell()) {
            this.showMessage('格子已满！');
            return;
        }
        
        this.playerResources.gold -= this.PET_PRICE;
        this.updateResourceUI();
        
        // 在合成系统中生成新萌宠
        if (this.mergeSystem) {
            this.mergeSystem.spawnNewPet();
        }
        
        this.showMessage('购买成功！');
    }
    
    /**
     * 抽卡
     */
    private onGacha(): void {
        if (this.playerResources.diamonds < GameConfig.GACHA.SINGLE_COST) {
            this.showMessage('钻石不足！');
            // TODO: 显示看广告获取钻石
            return;
        }
        
        // 跳转到抽卡场景
        director.loadScene('GachaScene');
    }
    
    /**
     * 合成成功回调
     */
    private onMergeSuccess(event: any): void {
        // 给予金币奖励
        const reward = event.detail.newLevel * 50;
        this.playerResources.gold += reward;
        this.updateResourceUI();
        
        this.showMessage(`合成成功！获得${reward}金币`);
    }
    
    /**
     * 更新资源显示
     */
    private updateResourceUI(): void {
        if (this.goldLabel) {
            this.goldLabel.string = `💰 ${this.playerResources.gold}`;
        }
        if (this.diamondLabel) {
            this.diamondLabel.string = `💎 ${this.playerResources.diamonds}`;
        }
        if (this.energyLabel) {
            this.energyLabel.string = `⚡ ${this.playerResources.energy}/${GameConfig.ECONOMY.MAX_ENERGY}`;
        }
    }
    
    /**
     * 开始体力恢复
     */
    private startEnergyRecovery(): void {
        this.schedule(() => {
            if (this.playerResources.energy < GameConfig.ECONOMY.MAX_ENERGY) {
                this.playerResources.energy++;
                this.updateResourceUI();
            }
        }, GameConfig.ECONOMY.ENERGY_RECOVER_TIME);
    }
    
    /**
     * 显示消息
     */
    private showMessage(msg: string): void {
        console.log(msg);
        // TODO: 显示Toast提示
    }
    
    /**
     * 增加金币（测试用）
     */
    addGold(amount: number): void {
        this.playerResources.gold += amount;
        this.updateResourceUI();
    }
    
    /**
     * 增加钻石
     */
    addDiamonds(amount: number): void {
        this.playerResources.diamonds += amount;
        this.updateResourceUI();
    }
}