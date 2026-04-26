import { _decorator, Component, Node, Label, Button, director } from 'cc';
import { PetManager } from './managers/PetManager';
import { BattleManager } from './managers/BattleManager';
import { RankManager } from './managers/RankManager';
import { FriendManager } from './managers/FriendManager';
import { ShopManager } from './managers/ShopManager';
import { BattlePassManager } from './managers/BattlePassManager';
import { GameConfig } from './config/GameConfig';

const { ccclass, property } = _decorator;

/**
 * 游戏主入口
 * 负责游戏初始化、场景切换、全局事件等
 */
@ccclass('GameMain')
export class GameMain extends Component {
    
    // UI节点引用
    @property(Label)
    diamondLabel: Label = null;      // 钻石显示
    
    @property(Label)
    energyLabel: Label = null;       // 体力显示
    
    @property(Button)
    startButton: Button = null;      // 开始按钮
    
    @property(Button)
    gachaButton: Button = null;      // 抽卡按钮
    
    @property(Button)
    bagButton: Button = null;        // 背包按钮
    
    @property(Button)
    rankButton: Button = null;       // 排行榜按钮
    
    @property(Button)
    shopButton: Button = null;       // 商城按钮
    
    @property(Button)
    battlePassButton: Button = null; // 战令按钮
    
    // 玩家数据
    private playerData = {
        diamonds: GameConfig.ECONOMY.START_DIAMONDS,
        energy: GameConfig.ECONOMY.START_ENERGY,
        gold: 0
    };
    
    onLoad() {
        // 初始化管理器
        this.initManagers();
        
        // 加载玩家数据
        this.loadPlayerData();
        
        // 绑定按钮事件
        this.bindEvents();
        
        // 更新UI
        this.updateUI();
        
        console.log('游戏初始化完成！');
    }
    
    start() {
        // 首次进入赠送抽卡
        if (!this.hasFirstGacha()) {
            this.doFirstGacha();
        }
    }
    
    /**
     * 初始化管理器
     */
    private initManagers(): void {
        // 确保管理器节点存在
        if (!this.getComponent(PetManager)) {
            this.addComponent(PetManager);
        }
        if (!this.getComponent(BattleManager)) {
            this.addComponent(BattleManager);
        }
        if (!this.getComponent(RankManager)) {
            this.addComponent(RankManager);
        }
        if (!this.getComponent(FriendManager)) {
            this.addComponent(FriendManager);
        }
        if (!this.getComponent(ShopManager)) {
            this.addComponent(ShopManager);
        }
        if (!this.getComponent(BattlePassManager)) {
            this.addComponent(BattlePassManager);
        }
    }
    
    /**
     * 绑定按钮事件
     */
    private bindEvents(): void {
        if (this.startButton) {
            this.startButton.node.on(Button.EventType.CLICK, this.onStartClick, this);
        }
        if (this.gachaButton) {
            this.gachaButton.node.on(Button.EventType.CLICK, this.onGachaClick, this);
        }
        if (this.bagButton) {
            this.bagButton.node.on(Button.EventType.CLICK, this.onBagClick, this);
        }
        if (this.rankButton) {
            this.rankButton.node.on(Button.EventType.CLICK, this.onRankClick, this);
        }
        if (this.shopButton) {
            this.shopButton.node.on(Button.EventType.CLICK, this.onShopClick, this);
        }
        if (this.battlePassButton) {
            this.battlePassButton.node.on(Button.EventType.CLICK, this.onBattlePassClick, this);
        }
    }
    
    /**
     * 开始游戏按钮点击
     */
    private onStartClick(): void {
        // 检查体力
        if (this.playerData.energy < 5) {
            console.log('体力不足！');
            // TODO: 显示体力不足提示
            return;
        }
        
        // 扣除体力
        this.playerData.energy -= 5;
        this.savePlayerData();
        this.updateUI();
        
        // 检查是否有出战阵容
        const battleTeam = PetManager.instance.getBattleTeam();
        if (battleTeam.length === 0) {
            console.log('请先设置出战阵容！');
            // TODO: 跳转到阵容设置界面
            return;
        }
        
        // 开始战斗
        BattleManager.instance.startBattle();
    }
    
    /**
     * 抽卡按钮点击
     */
    private onGachaClick(): void {
        // 跳转到抽卡场景
        director.loadScene('GachaScene');
    }
    
    /**
     * 背包按钮点击
     */
    private onBagClick(): void {
        // 跳转到背包场景
        director.loadScene('BagScene');
    }
    
    /**
     * 排行榜按钮点击
     */
    private onRankClick(): void {
        director.loadScene('RankScene');
    }
    
    /**
     * 商城按钮点击
     */
    private onShopClick(): void {
        director.loadScene('ShopScene');
    }
    
    /**
     * 战令按钮点击
     */
    private onBattlePassClick(): void {
        director.loadScene('BattlePassScene');
    }
    
    /**
     * 首次抽卡（新手福利）
     */
    private doFirstGacha(): void {
        console.log('首次抽卡，赠送萌宠！');
        const pets = PetManager.instance.gachaDraw(3);
        
        // 自动设置第一只为出战
        if (pets.length > 0) {
            PetManager.instance.setBattleTeam([pets[0].id]);
        }
        
        // 标记已完成首次抽卡
        this.markFirstGacha();
        
        // TODO: 显示抽卡结果动画
    }
    
    /**
     * 更新UI显示
     */
    private updateUI(): void {
        if (this.diamondLabel) {
            this.diamondLabel.string = `💎 ${this.playerData.diamonds}`;
        }
        if (this.energyLabel) {
            this.energyLabel.string = `⚡ ${this.playerData.energy}/${GameConfig.ECONOMY.MAX_ENERGY}`;
        }
    }
    
    /**
     * 加载玩家数据
     */
    private loadPlayerData(): void {
        // 从本地存储或服务器加载
        const savedData = localStorage.getItem('playerData');
        if (savedData) {
            this.playerData = JSON.parse(savedData);
        }
    }
    
    /**
     * 保存玩家数据
     */
    private savePlayerData(): void {
        localStorage.setItem('playerData', JSON.stringify(this.playerData));
    }
    
    /**
     * 检查是否已完成首次抽卡
     */
    private hasFirstGacha(): boolean {
        return localStorage.getItem('firstGacha') === 'done';
    }
    
    /**
     * 标记已完成首次抽卡
     */
    private markFirstGacha(): void {
        localStorage.setItem('firstGacha', 'done');
    }
    
    /**
     * 增加钻石
     */
    addDiamonds(amount: number): void {
        this.playerData.diamonds += amount;
        this.savePlayerData();
        this.updateUI();
    }
    
    /**
     * 消耗钻石
     */
    consumeDiamonds(amount: number): boolean {
        if (this.playerData.diamonds >= amount) {
            this.playerData.diamonds -= amount;
            this.savePlayerData();
            this.updateUI();
            return true;
        }
        return false;
    }
    
    /**
     * 恢复体力
     */
    recoverEnergy(): void {
        if (this.playerData.energy < GameConfig.ECONOMY.MAX_ENERGY) {
            this.playerData.energy++;
            this.savePlayerData();
            this.updateUI();
        }
    }
}