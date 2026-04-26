import { _decorator, Component } from 'cc';
import { GameConfig } from '../config/GameConfig';

const { ccclass } = _decorator;

/**
 * 商品数据
 */
export interface ShopItem {
    id: string;
    name: string;
    type: 'diamond' | 'gold' | 'energy' | 'gacha' | 'pet' | 'skin';
    icon: string;
    price: number;
    priceType: 'rmb' | 'gold' | 'diamond';
    amount: number;
    bonus?: number;
    tag?: string; // 'hot', 'new', 'discount'
    discount?: number;
}

/**
 * 商城管理器
 * 负责商品展示、购买、订单处理
 */
@ccclass('ShopManager')
export class ShopManager extends Component {
    
    // 单例
    private static _instance: ShopManager = null;
    public static get instance(): ShopManager {
        return ShopManager._instance;
    }
    
    // 商品列表
    private shopItems: ShopItem[] = [];
    
    // 玩家货币
    private playerCurrency = {
        gold: 0,
        diamond: GameConfig.ECONOMY.START_DIAMONDS,
        rmb: 0
    };
    
    onLoad() {
        if (ShopManager._instance === null) {
            ShopManager._instance = this;
        }
        this.initShopItems();
        this.loadPlayerData();
    }
    
    /**
     * 初始化商品
     */
    private initShopItems(): void {
        this.shopItems = [
            // 钻石充值
            { id: 'diamond_60', name: '60钻石', type: 'diamond', icon: 'icon_diamond', price: 6, priceType: 'rmb', amount: 60, bonus: 0 },
            { id: 'diamond_300', name: '300钻石', type: 'diamond', icon: 'icon_diamond', price: 30, priceType: 'rmb', amount: 300, bonus: 30, tag: 'hot' },
            { id: 'diamond_680', name: '680钻石', type: 'diamond', icon: 'icon_diamond', price: 68, priceType: 'rmb', amount: 680, bonus: 80 },
            { id: 'diamond_1280', name: '1280钻石', type: 'diamond', icon: 'icon_diamond', price: 128, priceType: 'rmb', amount: 1280, bonus: 200, tag: 'hot' },
            { id: 'diamond_3280', name: '3280钻石', type: 'diamond', icon: 'icon_diamond', price: 328, priceType: 'rmb', amount: 3280, bonus: 600 },
            { id: 'diamond_6480', name: '6480钻石', type: 'diamond', icon: 'icon_diamond', price: 648, priceType: 'rmb', amount: 6480, bonus: 1500, tag: 'new' },
            
            // 金币购买
            { id: 'gold_1000', name: '1000金币', type: 'gold', icon: 'icon_gold', price: 50, priceType: 'diamond', amount: 1000 },
            { id: 'gold_5000', name: '5000金币', type: 'gold', icon: 'icon_gold', price: 200, priceType: 'diamond', amount: 5000, bonus: 500 },
            { id: 'gold_20000', name: '20000金币', type: 'gold', icon: 'icon_gold', price: 600, priceType: 'diamond', amount: 20000, bonus: 3000, tag: 'hot' },
            
            // 体力购买
            { id: 'energy_50', name: '50体力', type: 'energy', icon: 'icon_energy', price: 50, priceType: 'diamond', amount: 50 },
            { id: 'energy_120', name: '120体力', type: 'energy', icon: 'icon_energy', price: 100, priceType: 'diamond', amount: 120, bonus: 20, tag: 'hot' },
            
            // 抽卡道具
            { id: 'gacha_ticket_1', name: '抽卡券', type: 'gacha', icon: 'icon_gacha', price: 100, priceType: 'diamond', amount: 1 },
            { id: 'gacha_ticket_10', name: '抽卡券x10', type: 'gacha', icon: 'icon_gacha', price: 900, priceType: 'diamond', amount: 10, bonus: 1, tag: 'hot' },
        ];
    }
    
    /**
     * 获取商品列表
     */
    getShopItems(type?: string): ShopItem[] {
        if (type) {
            return this.shopItems.filter(item => item.type === type);
        }
        return this.shopItems;
    }
    
    /**
     * 购买商品
     */
    async buyItem(itemId: string): Promise<boolean> {
        const item = this.shopItems.find(i => i.id === itemId);
        if (!item) {
            console.error('商品不存在');
            return false;
        }
        
        // 检查货币是否足够
        if (!this.checkCurrency(item.priceType, item.price)) {
            console.log('货币不足');
            return false;
        }
        
        // 扣除货币
        this.consumeCurrency(item.priceType, item.price);
        
        // 发放奖励
        this.grantReward(item);
        
        // 保存数据
        this.savePlayerData();
        
        console.log(`购买成功: ${item.name}`);
        return true;
    }
    
    /**
     * 检查货币是否足够
     */
    private checkCurrency(type: string, amount: number): boolean {
        switch (type) {
            case 'rmb':
                // TODO: 实际支付流程
                return true;
            case 'gold':
                return this.playerCurrency.gold >= amount;
            case 'diamond':
                return this.playerCurrency.diamond >= amount;
            default:
                return false;
        }
    }
    
    /**
     * 扣除货币
     */
    private consumeCurrency(type: string, amount: number): void {
        switch (type) {
            case 'gold':
                this.playerCurrency.gold -= amount;
                break;
            case 'diamond':
                this.playerCurrency.diamond -= amount;
                break;
        }
    }
    
    /**
     * 发放奖励
     */
    private grantReward(item: ShopItem): void {
        const totalAmount = item.amount + (item.bonus || 0);
        
        switch (item.type) {
            case 'diamond':
                this.playerCurrency.diamond += totalAmount;
                break;
            case 'gold':
                this.playerCurrency.gold += totalAmount;
                break;
            case 'energy':
                // TODO: 增加体力
                break;
            case 'gacha':
                // TODO: 增加抽卡券
                break;
        }
    }
    
    /**
     * 获取玩家货币
     */
    getPlayerCurrency(): { gold: number, diamond: number } {
        return {
            gold: this.playerCurrency.gold,
            diamond: this.playerCurrency.diamond
        };
    }
    
    /**
     * 增加金币
     */
    addGold(amount: number): void {
        this.playerCurrency.gold += amount;
        this.savePlayerData();
    }
    
    /**
     * 增加钻石
     */
    addDiamond(amount: number): void {
        this.playerCurrency.diamond += amount;
        this.savePlayerData();
    }
    
    /**
     * 微信支付购买
     */
    async wxPay(itemId: string): Promise<boolean> {
        const item = this.shopItems.find(i => i.id === itemId);
        if (!item || item.priceType !== 'rmb') {
            return false;
        }
        
        // TODO: 接入微信支付
        console.log(`发起微信支付: ${item.price}元`);
        
        // 模拟支付成功
        this.grantReward(item);
        this.savePlayerData();
        
        return true;
    }
    
    /**
     * 加载玩家数据
     */
    private loadPlayerData(): void {
        const saved = localStorage.getItem('shopData');
        if (saved) {
            const data = JSON.parse(saved);
            this.playerCurrency.gold = data.gold || 0;
            this.playerCurrency.diamond = data.diamond || GameConfig.ECONOMY.START_DIAMONDS;
        }
    }
    
    /**
     * 保存玩家数据
     */
    private savePlayerData(): void {
        localStorage.setItem('shopData', JSON.stringify(this.playerCurrency));
    }
}