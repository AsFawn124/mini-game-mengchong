/**
 * 抽卡场景UI
 * 抽卡界面，包含单抽、十连抽等功能
 */

import GameMain from '../GameMain';
import { GameConfig } from '../GameConfig';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GachaSceneUI extends cc.Component {
    
    // UI组件引用
    @property(cc.Node)
    singleDrawBtn: cc.Node = null;
    
    @property(cc.Node)
    tenDrawBtn: cc.Node = null;
    
    @property(cc.Label)
    singleCostLabel: cc.Label = null;
    
    @property(cc.Label)
    tenCostLabel: cc.Label = null;
    
    @property(cc.Label)
    diamondLabel: cc.Label = null;
    
    @property(cc.Node)
    resultPanel: cc.Node = null;
    
    @property(cc.Node)
    resultContent: cc.Node = null;
    
    @property(cc.Node)
    backButton: cc.Node = null;
    
    @property(cc.Node)
    againButton: cc.Node = null;
    
    // 用户数据
    private _diamond: number = 100;
    private _isDrawing: boolean = false;
    
    onLoad() {
        console.log('[GachaSceneUI] 抽卡场景加载');
        this._initUI();
    }
    
    start() {
        this._refreshUI();
    }
    
    /**
     * 初始化UI
     */
    private _initUI(): void {
        // 设置按钮事件
        this.singleDrawBtn.on(cc.Node.EventType.TOUCH_END, this._onSingleDraw, this);
        this.tenDrawBtn.on(cc.Node.EventType.TOUCH_END, this._onTenDraw, this);
        this.backButton.on(cc.Node.EventType.TOUCH_END, this._onBack, this);
        this.againButton.on(cc.Node.EventType.TOUCH_END, this._onDrawAgain, this);
        
        // 设置价格显示
        this.singleCostLabel.string = GameConfig.BASE_GACHA_COST.toString();
        this.tenCostLabel.string = GameConfig.GACHA_COST_10.toString();
        
        // 隐藏结果面板
        this.resultPanel.active = false;
    }
    
    /**
     * 刷新UI
     */
    private _refreshUI(): void {
        this.diamondLabel.string = this._diamond.toString();
        
        // 检查按钮状态
        this.singleDrawBtn.getComponent(cc.Button).interactable = this._diamond >= GameConfig.BASE_GACHA_COST && !this._isDrawing;
        this.tenDrawBtn.getComponent(cc.Button).interactable = this._diamond >= GameConfig.GACHA_COST_10 && !this._isDrawing;
    }
    
    /**
     * 单抽
     */
    private _onSingleDraw(): void {
        if (this._isDrawing) return;
        
        const cost = GameConfig.BASE_GACHA_COST;
        if (this._diamond < cost) {
            this._showToast('钻石不足！');
            return;
        }
        
        this._performDraw(1, cost);
    }
    
    /**
     * 十连抽
     */
    private _onTenDraw(): void {
        if (this._isDrawing) return;
        
        const cost = GameConfig.GACHA_COST_10;
        if (this._diamond < cost) {
            this._showToast('钻石不足！');
            return;
        }
        
        this._performDraw(10, cost);
    }
    
    /**
     * 执行抽卡
     */
    private _performDraw(count: number, cost: number): void {
        this._isDrawing = true;
        this._refreshUI();
        
        // 扣除钻石
        this._diamond -= cost;
        
        // 播放抽卡音效
        GameMain.instance?.audioManager.playGacha();
        
        // 播放抽卡动画
        this._playDrawAnimation(() => {
            // 执行抽卡逻辑
            const results = GameMain.instance?.petManager.gacha(count);
            
            // 显示结果
            this._showResult(results);
            
            this._isDrawing = false;
            this._refreshUI();
        });
    }
    
    /**
     * 播放抽卡动画
     */
    private _playDrawAnimation(callback: () => void): void {
        // 创建动画节点
        const animNode = new cc.Node('GachaAnim');
        animNode.setPosition(0, 0);
        this.node.addChild(animNode);
        
        // 简单的缩放动画模拟抽卡过程
        const sprite = animNode.addComponent(cc.Sprite);
        // TODO: 设置抽卡动画图片
        
        cc.tween(animNode)
            .to(0.5, { scale: 1.2 })
            .to(0.5, { scale: 1.0 })
            .call(() => {
                animNode.destroy();
                callback();
            })
            .start();
    }
    
    /**
     * 显示抽卡结果
     */
    private _showResult(petIds: string[]): void {
        this.resultPanel.active = true;
        this.resultContent.removeAllChildren();
        
        // 显示获得的萌宠
        petIds.forEach((petId, index) => {
            const template = this._getPetTemplate(petId);
            if (template) {
                const node = this._createResultPetNode(template, index);
                this.resultContent.addChild(node);
            }
        });
    }
    
    /**
     * 创建结果萌宠节点
     */
    private _createResultPetNode(template: any, index: number): cc.Node {
        const node = new cc.Node('ResultPet');
        
        // 布局位置
        const cols = 5;
        const x = (index % cols - 2) * 150;
        const y = Math.floor(index / cols) * -200 + 100;
        node.setPosition(x, y);
        
        // 背景（根据稀有度设置颜色）
        const bg = node.addComponent(cc.Sprite);
        // TODO: 根据稀有度设置不同背景
        
        // 萌宠图片
        const spriteNode = new cc.Node('Sprite');
        const sprite = spriteNode.addComponent(cc.Sprite);
        // TODO: 设置萌宠图片
        node.addChild(spriteNode);
        
        // 名称
        const nameNode = new cc.Node('Name');
        const nameLabel = nameNode.addComponent(cc.Label);
        nameLabel.string = template.name;
        nameLabel.fontSize = 22;
        nameNode.setPosition(0, -70);
        node.addChild(nameNode);
        
        // 稀有度标识
        const rarityNode = new cc.Node('Rarity');
        const rarityLabel = rarityNode.addComponent(cc.Label);
        rarityLabel.string = template.rarity;
        rarityLabel.fontSize = 18;
        rarityLabel.color = this._getRarityColor(template.rarity);
        rarityNode.setPosition(0, 70);
        node.addChild(rarityNode);
        
        // 入场动画
        node.scale = 0;
        cc.tween(node)
            .delay(index * 0.1)
            .to(0.3, { scale: 1 }, { easing: 'backOut' })
            .start();
        
        return node;
    }
    
    /**
     * 获取萌宠模板数据
     */
    private _getPetTemplate(petId: string): any {
        // 从GameConfig中获取萌宠数据
        const { PET_DATA } = require('../GameConfig');
        return PET_DATA.find(p => p.id === petId);
    }
    
    /**
     * 获取稀有度颜色
     */
    private _getRarityColor(rarity: string): cc.Color {
        const colors = {
            'N': cc.Color.GRAY,
            'R': cc.Color.GREEN,
            'SR': cc.Color.MAGENTA,
            'SSR': cc.Color.ORANGE
        };
        return colors[rarity] || cc.Color.WHITE;
    }
    
    /**
     * 再抽一次
     */
    private _onDrawAgain(): void {
        this.resultPanel.active = false;
        
        // 判断上次是单抽还是十连
        const lastDrawCount = this.resultContent.children.length;
        if (lastDrawCount === 10) {
            this._onTenDraw();
        } else {
            this._onSingleDraw();
        }
    }
    
    /**
     * 返回主场景
     */
    private _onBack(): void {
        GameMain.instance?.audioManager.playButtonClick();
        GameMain.instance?.enterScene('MainScene');
    }
    
    /**
     * 显示Toast提示
     */
    private _showToast(message: string): void {
        const toastNode = new cc.Node('Toast');
        toastNode.setPosition(0, 0);
        
        const label = toastNode.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 28;
        label.color = cc.Color.WHITE;
        
        this.node.addChild(toastNode);
        
        toastNode.opacity = 0;
        cc.tween(toastNode)
            .to(0.3, { opacity: 255 })
            .delay(1.5)
            .to(0.3, { opacity: 0 })
            .call(() => toastNode.destroy())
            .start();
    }
}
