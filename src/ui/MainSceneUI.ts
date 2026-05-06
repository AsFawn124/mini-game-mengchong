/**
 * 主场景UI
 * 游戏主界面，包含萌宠展示、功能入口等
 */

import GameMain from '../GameMain';
import { Pet } from '../managers/PetManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainSceneUI extends cc.Component {
    
    // UI组件引用
    @property(cc.Label)
    goldLabel: cc.Label = null;
    
    @property(cc.Label)
    diamondLabel: cc.Label = null;
    
    @property(cc.Label)
    levelLabel: cc.Label = null;
    
    @property(cc.Node)
    petContainer: cc.Node = null;
    
    @property(cc.Node)
    battleButton: cc.Node = null;
    
    @property(cc.Node)
    gachaButton: cc.Node = null;
    
    @property(cc.Node)
    bagButton: cc.Node = null;
    
    @property(cc.Node)
    shopButton: cc.Node = null;
    
    // 用户数据
    private _userData: any = {
        gold: 1000,
        diamond: 100,
        level: 1
    };
    
    onLoad() {
        console.log('[MainSceneUI] 主场景加载');
        this._initUI();
        this._bindEvents();
    }
    
    start() {
        this._refreshUI();
        this._showTeamPets();
    }
    
    /**
     * 初始化UI
     */
    private _initUI(): void {
        // 设置按钮点击事件
        this.battleButton.on(cc.Node.EventType.TOUCH_END, this._onBattleClick, this);
        this.gachaButton.on(cc.Node.EventType.TOUCH_END, this._onGachaClick, this);
        this.bagButton.on(cc.Node.EventType.TOUCH_END, this._onBagClick, this);
        this.shopButton.on(cc.Node.EventType.TOUCH_END, this._onShopClick, this);
    }
    
    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        // 监听数据更新事件
        cc.game.on('user_data_update', this._onUserDataUpdate, this);
    }
    
    /**
     * 刷新UI显示
     */
    private _refreshUI(): void {
        this.goldLabel.string = this._formatNumber(this._userData.gold);
        this.diamondLabel.string = this._formatNumber(this._userData.diamond);
        this.levelLabel.string = `Lv.${this._userData.level}`;
    }
    
    /**
     * 显示上阵萌宠
     */
    private _showTeamPets(): void {
        if (!GameMain.instance) return;
        
        const team = GameMain.instance.petManager.getTeam();
        
        // 清空容器
        this.petContainer.removeAllChildren();
        
        // 显示上阵萌宠
        team.forEach((pet, index) => {
            const petNode = this._createPetNode(pet, index);
            this.petContainer.addChild(petNode);
        });
        
        // 如果上阵数量不足，显示空位
        for (let i = team.length; i < 3; i++) {
            const emptyNode = this._createEmptySlot(i);
            this.petContainer.addChild(emptyNode);
        }
    }
    
    /**
     * 创建萌宠节点
     */
    private _createPetNode(pet: Pet, index: number): cc.Node {
        const node = new cc.Node('Pet');
        node.setPosition(index * 200 - 200, 0);
        
        // 背景
        const bg = node.addComponent(cc.Sprite);
        // TODO: 设置萌宠背景图
        
        // 名称
        const nameNode = new cc.Node('Name');
        const nameLabel = nameNode.addComponent(cc.Label);
        nameLabel.string = pet.name;
        nameLabel.fontSize = 24;
        nameLabel.color = cc.Color.WHITE;
        nameNode.setPosition(0, -80);
        node.addChild(nameNode);
        
        // 等级
        const levelNode = new cc.Node('Level');
        const levelLabel = levelNode.addComponent(cc.Label);
        levelLabel.string = `Lv.${pet.level}`;
        levelLabel.fontSize = 20;
        levelLabel.color = cc.Color.YELLOW;
        levelNode.setPosition(0, -110);
        node.addChild(levelNode);
        
        // 点击事件
        node.on(cc.Node.EventType.TOUCH_END, () => {
            this._onPetClick(pet);
        });
        
        return node;
    }
    
    /**
     * 创建空位节点
     */
    private _createEmptySlot(index: number): cc.Node {
        const node = new cc.Node('EmptySlot');
        node.setPosition(index * 200 - 200, 0);
        
        // 背景
        const bg = node.addComponent(cc.Sprite);
        // TODO: 设置空位背景图
        
        // 提示文字
        const tipNode = new cc.Node('Tip');
        const tipLabel = tipNode.addComponent(cc.Label);
        tipLabel.string = '点击上阵';
        tipLabel.fontSize = 20;
        tipLabel.color = cc.Color.GRAY;
        tipNode.setPosition(0, 0);
        node.addChild(tipNode);
        
        // 点击事件
        node.on(cc.Node.EventType.TOUCH_END, () => {
            this._onEmptySlotClick();
        });
        
        return node;
    }
    
    /**
     * 点击战斗按钮
     */
    private _onBattleClick(): void {
        console.log('[MainSceneUI] 进入战斗');
        
        // 播放音效
        if (GameMain.instance) {
            GameMain.instance.audioManager.playButtonClick();
        }
        
        // 检查是否有上阵萌宠
        const team = GameMain.instance?.petManager.getTeam();
        if (!team || team.length === 0) {
            this._showToast('请先上阵萌宠！');
            return;
        }
        
        // 切换到战斗场景
        GameMain.instance?.enterScene('BattleScene');
    }
    
    /**
     * 点击抽卡按钮
     */
    private _onGachaClick(): void {
        console.log('[MainSceneUI] 进入抽卡');
        
        if (GameMain.instance) {
            GameMain.instance.audioManager.playButtonClick();
        }
        
        GameMain.instance?.enterScene('GachaScene');
    }
    
    /**
     * 点击背包按钮
     */
    private _onBagClick(): void {
        console.log('[MainSceneUI] 进入背包');
        
        if (GameMain.instance) {
            GameMain.instance.audioManager.playButtonClick();
        }
        
        GameMain.instance?.enterScene('BagScene');
    }
    
    /**
     * 点击商店按钮
     */
    private _onShopClick(): void {
        console.log('[MainSceneUI] 进入商店');
        
        if (GameMain.instance) {
            GameMain.instance.audioManager.playButtonClick();
        }
        
        this._showToast('商店功能开发中...');
    }
    
    /**
     * 点击萌宠
     */
    private _onPetClick(pet: Pet): void {
        console.log('[MainSceneUI] 点击萌宠:', pet.name);
        
        // 显示萌宠详情弹窗
        this._showPetDetail(pet);
    }
    
    /**
     * 点击空位
     */
    private _onEmptySlotClick(): void {
        console.log('[MainSceneUI] 点击空位');
        
        // 跳转到背包选择萌宠
        GameMain.instance?.enterScene('BagScene');
    }
    
    /**
     * 显示萌宠详情
     */
    private _showPetDetail(pet: Pet): void {
        // TODO: 实现萌宠详情弹窗
        console.log('[MainSceneUI] 显示萌宠详情:', pet);
    }
    
    /**
     * 显示Toast提示
     */
    private _showToast(message: string): void {
        // 创建Toast节点
        const toastNode = new cc.Node('Toast');
        toastNode.setPosition(0, 0);
        
        const bg = toastNode.addComponent(cc.Sprite);
        // TODO: 设置背景
        
        const label = toastNode.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 28;
        label.color = cc.Color.WHITE;
        
        this.node.addChild(toastNode);
        
        // 动画显示
        toastNode.opacity = 0;
        cc.tween(toastNode)
            .to(0.3, { opacity: 255, y: 50 })
            .delay(2)
            .to(0.3, { opacity: 0, y: 100 })
            .call(() => toastNode.destroy())
            .start();
    }
    
    /**
     * 用户数据更新回调
     */
    private _onUserDataUpdate(data: any): void {
        this._userData = { ...this._userData, ...data };
        this._refreshUI();
    }
    
    /**
     * 格式化数字
     */
    private _formatNumber(num: number): string {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toString();
    }
    
    onDestroy() {
        cc.game.off('user_data_update', this._onUserDataUpdate, this);
    }
}
