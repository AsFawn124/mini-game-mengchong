import { _decorator, Component, Node, Label, Button, ScrollView, instantiate, Sprite } from 'cc';
import { ShopManager, ShopItem } from '../managers/ShopManager';

const { ccclass, property } = _decorator;

/**
 * 商城场景UI
 */
@ccclass('ShopSceneUI')
export class ShopSceneUI extends Component {
    
    @property(Label)
    goldLabel: Label = null;
    
    @property(Label)
    diamondLabel: Label = null;
    
    @property(ScrollView)
    shopScrollView: ScrollView = null;
    
    @property(Node)
    shopItemPrefab: Node = null;
    
    @property(Button)
    backBtn: Button = null;
    
    @property(Button)
    diamondTab: Button = null;
    
    @property(Button)
    goldTab: Button = null;
    
    @property(Button)
    gachaTab: Button = null;
    
    private currentTab: string = 'diamond';
    
    onLoad() {
        this.bindEvents();
        this.updateCurrencyUI();
        this.loadShopItems('diamond');
    }
    
    private bindEvents(): void {
        if (this.backBtn) {
            this.backBtn.node.on(Button.EventType.CLICK, this.onBack, this);
        }
        if (this.diamondTab) {
            this.diamondTab.node.on(Button.EventType.CLICK, () => this.onTabClick('diamond'), this);
        }
        if (this.goldTab) {
            this.goldTab.node.on(Button.EventType.CLICK, () => this.onTabClick('gold'), this);
        }
        if (this.gachaTab) {
            this.gachaTab.node.on(Button.EventType.CLICK, () => this.onTabClick('gacha'), this);
        }
    }
    
    private updateCurrencyUI(): void {
        const currency = ShopManager.instance.getPlayerCurrency();
        
        if (this.goldLabel) {
            this.goldLabel.string = `💰 ${currency.gold}`;
        }
        if (this.diamondLabel) {
            this.diamondLabel.string = `💎 ${currency.diamond}`;
        }
    }
    
    private loadShopItems(type: string): void {
        this.currentTab = type;
        
        const items = ShopManager.instance.getShopItems(type);
        this.updateShopList(items);
    }
    
    private updateShopList(items: ShopItem[]): void {
        if (!this.shopScrollView || !this.shopItemPrefab) return;
        
        const content = this.shopScrollView.content;
        content.removeAllChildren();
        
        items.forEach(item => {
            const node = instantiate(this.shopItemPrefab);
            this.updateShopItem(node, item);
            content.addChild(node);
        });
    }
    
    private updateShopItem(node: Node, item: ShopItem): void {
        const nameLabel = node.getChildByName('NameLabel')?.getComponent(Label);
        const priceLabel = node.getChildByName('PriceLabel')?.getComponent(Label);
        const amountLabel = node.getChildByName('AmountLabel')?.getComponent(Label);
        const buyBtn = node.getChildByName('BuyButton')?.getComponent(Button);
        const tagSprite = node.getChildByName('TagSprite')?.getComponent(Sprite);
        
        if (nameLabel) nameLabel.string = item.name;
        if (priceLabel) priceLabel.string = `${item.price} ${item.priceType === 'rmb' ? '元' : ''}`;
        if (amountLabel) amountLabel.string = `${item.amount}${item.bonus ? `+${item.bonus}` : ''}`;
        
        if (buyBtn) {
            buyBtn.node.on(Button.EventType.CLICK, () => this.onBuy(item), this);
        }
    }
    
    private async onBuy(item: ShopItem): Promise<void> {
        if (item.priceType === 'rmb') {
            // 微信支付
            const success = await ShopManager.instance.wxPay(item.id);
            if (success) {
                this.showMessage('购买成功！');
                this.updateCurrencyUI();
            }
        } else {
            // 游戏内货币购买
            const success = await ShopManager.instance.buyItem(item.id);
            if (success) {
                this.showMessage('购买成功！');
                this.updateCurrencyUI();
            } else {
                this.showMessage('货币不足！');
            }
        }
    }
    
    private onTabClick(type: string): void {
        this.loadShopItems(type);
    }
    
    private onBack(): void {
        const { director } = require('cc');
        director.loadScene('MainScene');
    }
    
    private showMessage(msg: string): void {
        console.log(msg);
        // TODO: 显示Toast
    }
}