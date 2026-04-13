import { _decorator, Component, Node, Label, Button, Sprite, Color } from 'cc';
import { PetManager, PetData } from '../managers/PetManager';
import { GameConfig } from '../config/GameConfig';
import { AudioManager } from '../managers/AudioManager';

const { ccclass, property } = _decorator;

/**
 * 抽卡场景UI
 * 负责抽卡界面的显示和交互
 */
@ccclass('GachaSceneUI')
export class GachaSceneUI extends Component {
    
    @property(Label)
    diamondLabel: Label = null;        // 钻石显示
    
    @property(Button)
    singleDrawBtn: Button = null;      // 单抽按钮
    
    @property(Button)
    tenDrawBtn: Button = null;         // 十连按钮
    
    @property(Button)
    backBtn: Button = null;            // 返回按钮
    
    @property(Node)
    resultPanel: Node = null;          // 结果面板
    
    @property(Node)
    petDisplayNode: Node = null;       // 萌宠展示节点
    
    // 玩家钻石
    private diamonds: number = GameConfig.ECONOMY.START_DIAMONDS;
    
    // 抽卡记录
    private drawHistory: { petId: string, rarity: string, timestamp: number }[] = [];
    
    onLoad() {
        this.bindEvents();
        this.updateDiamondUI();
        this.loadPlayerData();
    }
    
    /**
     * 绑定按钮事件
     */
    private bindEvents(): void {
        if (this.singleDrawBtn) {
            this.singleDrawBtn.node.on(Button.EventType.CLICK, this.onSingleDraw, this);
        }
        if (this.tenDrawBtn) {
            this.tenDrawBtn.node.on(Button.EventType.CLICK, this.onTenDraw, this);
        }
        if (this.backBtn) {
            this.backBtn.node.on(Button.EventType.CLICK, this.onBack, this);
        }
    }
    
    /**
     * 单抽
     */
    private onSingleDraw(): void {
        if (this.diamonds < GameConfig.GACHA.SINGLE_COST) {
            this.showMessage('钻石不足！');
            this.showAdOption();
            return;
        }
        
        // 扣除钻石
        this.diamonds -= GameConfig.GACHA.SINGLE_COST;
        this.updateDiamondUI();
        this.savePlayerData();
        
        // 播放抽卡动画
        this.playGachaAnimation(1);
    }
    
    /**
     * 十连抽
     */
    private onTenDraw(): void {
        if (this.diamonds < GameConfig.GACHA.TEN_COST) {
            this.showMessage('钻石不足！');
            return;
        }
        
        // 扣除钻石
        this.diamonds -= GameConfig.GACHA.TEN_COST;
        this.updateDiamondUI();
        this.savePlayerData();
        
        // 播放抽卡动画
        this.playGachaAnimation(10);
    }
    
    /**
     * 播放抽卡动画
     */
    private playGachaAnimation(times: number): void {
        // 播放音效
        AudioManager.instance?.playSFX(AudioManager.SFX.GACHA_RESULT);
        
        // 显示抽卡动画
        console.log(`开始${times}连抽...`);
        
        // 模拟动画延迟
        setTimeout(() => {
            // 执行抽卡
            const results = PetManager.instance.gachaDraw(times);
            
            // 显示结果
            this.showResults(results);
            
            // 记录历史
            results.forEach(pet => {
                this.drawHistory.push({
                    petId: pet.id,
                    rarity: pet.rarity,
                    timestamp: Date.now()
                });
            });
            
        }, 1500);
    }
    
    /**
     * 显示抽卡结果
     */
    private showResults(pets: PetData[]): void {
        if (this.resultPanel) {
            this.resultPanel.active = true;
        }
        
        // 显示获得的萌宠
        pets.forEach((pet, index) => {
            console.log(`获得: ${pet.name} [${pet.rarity}]`);
            
            // 高稀有度特效
            if (pet.rarity === 'SSR') {
                this.playSSREffect();
            } else if (pet.rarity === 'SR') {
                this.playSREffect();
            }
        });
        
        // 显示分享按钮
        if (pets.some(p => p.rarity === 'SSR' || p.rarity === 'SR')) {
            this.showShareButton();
        }
    }
    
    /**
     * 播放SSR特效
     */
    private playSSREffect(): void {
        console.log('SSR特效！彩虹+全屏闪光');
        // TODO: 播放SSR特效动画
    }
    
    /**
     * 播放SR特效
     */
    private playSREffect(): void {
        console.log('SR特效！金光');
        // TODO: 播放SR特效动画
    }
    
    /**
     * 显示看广告选项
     */
    private showAdOption(): void {
        console.log('显示看广告获取钻石选项');
        // TODO: 显示激励视频按钮
    }
    
    /**
     * 显示分享按钮
     */
    private showShareButton(): void {
        console.log('显示分享按钮');
        // TODO: 显示分享获得奖励按钮
    }
    
    /**
     * 返回主界面
     */
    private onBack(): void {
        // 返回主场景
        const { director } = require('cc');
        director.loadScene('MainScene');
    }
    
    /**
     * 更新钻石显示
     */
    private updateDiamondUI(): void {
        if (this.diamondLabel) {
            this.diamondLabel.string = `💎 ${this.diamonds}`;
        }
    }
    
    /**
     * 显示消息
     */
    private showMessage(msg: string): void {
        console.log(msg);
        // TODO: 显示Toast
    }
    
    /**
     * 加载玩家数据
     */
    private loadPlayerData(): void {
        const saved = localStorage.getItem('playerData');
        if (saved) {
            const data = JSON.parse(saved);
            this.diamonds = data.diamonds ?? GameConfig.ECONOMY.START_DIAMONDS;
            this.drawHistory = data.drawHistory ?? [];
        }
    }
    
    /**
     * 保存玩家数据
     */
    private savePlayerData(): void {
        const saved = localStorage.getItem('playerData');
        const data = saved ? JSON.parse(saved) : {};
        data.diamonds = this.diamonds;
        data.drawHistory = this.drawHistory;
        localStorage.setItem('playerData', JSON.stringify(data));
    }
}