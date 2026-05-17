/**
 * UI管理器
 * 统一管理游戏UI的创建、显示、隐藏和切换
 */

import MainSceneUI from '../ui/MainSceneUI';
import BattleSceneUI from '../ui/BattleSceneUI';
import GachaSceneUI from '../ui/GachaSceneUI';
import BagSceneUI from '../ui/BagSceneUI';

const { ccclass } = cc._decorator;

export enum SceneType {
    MAIN = 'MainScene',
    BATTLE = 'BattleScene',
    GACHA = 'GachaScene',
    BAG = 'BagScene',
    SHOP = 'ShopScene',
    RANK = 'RankScene',
    FRIEND = 'FriendScene',
    SETTING = 'SettingScene',
    BATTLE_PASS = 'BattlePassScene'
}

export enum PopupType {
    TOAST = 'Toast',
    CONFIRM = 'ConfirmDialog',
    ALERT = 'AlertDialog',
    PET_DETAIL = 'PetDetailPopup',
    SKILL_SELECT = 'SkillSelectPopup',
    GACHA_RESULT = 'GachaResultPopup',
    BATTLE_RESULT = 'BattleResultPopup',
    SHOP_BUY = 'ShopBuyPopup',
    SETTINGS = 'SettingsPopup'
}

export interface ToastOptions {
    message: string;
    duration?: number;
    position?: 'top' | 'center' | 'bottom';
    icon?: string;
}

export interface DialogOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

@ccclass
export class UIManager extends cc.Component {
    
    private static _instance: UIManager = null;
    public static get instance(): UIManager {
        return UIManager._instance;
    }
    
    // 当前场景
    private _currentScene: SceneType = null;
    private _currentSceneNode: cc.Node = null;
    
    // UI层级
    private _sceneLayer: cc.Node = null;
    private _popupLayer: cc.Node = null;
    private _overlayLayer: cc.Node = null;
    private _toastLayer: cc.Node = null;
    
    // 弹窗栈
    private _popupStack: cc.Node[] = [];
    
    // UI预制体缓存
    private _prefabCache: Map<string, cc.Prefab> = new Map();
    
    onLoad() {
        if (UIManager._instance === null) {
            UIManager._instance = this;
            cc.game.addPersistRootNode(this.node);
            this._initLayers();
            console.log('[UIManager] 初始化完成');
        } else {
            this.destroy();
        }
    }
    
    /**
     * 初始化UI层级
     */
    private _initLayers(): void {
        // 创建场景层
        this._sceneLayer = new cc.Node('SceneLayer');
        this._sceneLayer.setContentSize(cc.winSize);
        this.node.addChild(this._sceneLayer);
        
        // 创建弹窗层
        this._popupLayer = new cc.Node('PopupLayer');
        this._popupLayer.setContentSize(cc.winSize);
        this.node.addChild(this._popupLayer);
        
        // 创建遮罩层
        this._overlayLayer = new cc.Node('OverlayLayer');
        this._overlayLayer.setContentSize(cc.winSize);
        this._overlayLayer.addComponent(cc.BlockInputEvents);
        const overlaySprite = this._overlayLayer.addComponent(cc.Sprite);
        // 创建半透明黑色纹理
        const texture = new cc.Texture2D();
        // overlaySprite.spriteFrame = new cc.SpriteFrame(texture);
        this._overlayLayer.color = cc.Color.BLACK;
        this._overlayLayer.opacity = 150;
        this._overlayLayer.active = false;
        this.node.addChild(this._overlayLayer);
        
        // 创建Toast层
        this._toastLayer = new cc.Node('ToastLayer');
        this._toastLayer.setContentSize(cc.winSize);
        this.node.addChild(this._toastLayer);
    }
    
    /**
     * 切换场景
     */
    public switchScene(sceneType: SceneType, data?: any): void {
        console.log(`[UIManager] 切换场景: ${sceneType}`);
        
        // 清理当前场景
        if (this._currentSceneNode) {
            this._currentSceneNode.destroy();
            this._currentSceneNode = null;
        }
        
        // 关闭所有弹窗
        this.closeAllPopups();
        
        this._currentScene = sceneType;
        
        // 加载新场景
        this._loadScene(sceneType, data);
    }
    
    /**
     * 加载场景
     */
    private _loadScene(sceneType: SceneType, data?: any): void {
        const scenePath = `scenes/${sceneType}`;
        
        cc.resources.load(scenePath, cc.Prefab, (err, prefab) => {
            if (err) {
                console.error(`[UIManager] 加载场景失败: ${sceneType}`, err);
                // 如果预制体加载失败，创建默认场景节点
                this._createDefaultScene(sceneType, data);
                return;
            }
            
            const sceneNode = cc.instantiate(prefab);
            sceneNode.setContentSize(cc.winSize);
            this._sceneLayer.addChild(sceneNode);
            this._currentSceneNode = sceneNode;
            
            // 初始化场景UI脚本
            this._initSceneScript(sceneNode, sceneType, data);
            
            console.log(`[UIManager] 场景加载完成: ${sceneType}`);
        });
    }
    
    /**
     * 创建默认场景（当预制体加载失败时使用）
     */
    private _createDefaultScene(sceneType: SceneType, data?: any): void {
        const sceneNode = new cc.Node(sceneType);
        sceneNode.setContentSize(cc.winSize);
        
        // 添加背景
        const bgNode = new cc.Node('Background');
        bgNode.setContentSize(cc.winSize);
        const bgSprite = bgNode.addComponent(cc.Sprite);
        bgSprite.color = this._getSceneColor(sceneType);
        sceneNode.addChild(bgNode);
        
        // 添加标题
        const titleNode = new cc.Node('Title');
        const titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = this._getSceneTitle(sceneType);
        titleLabel.fontSize = 48;
        titleLabel.color = cc.Color.WHITE;
        titleNode.setPosition(0, 300);
        sceneNode.addChild(titleNode);
        
        this._sceneLayer.addChild(sceneNode);
        this._currentSceneNode = sceneNode;
        
        console.log(`[UIManager] 创建默认场景: ${sceneType}`);
    }
    
    /**
     * 获取场景颜色
     */
    private _getSceneColor(sceneType: SceneType): cc.Color {
        const colors = {
            [SceneType.MAIN]: new cc.Color(255, 245, 238),
            [SceneType.BATTLE]: new cc.Color(40, 40, 60),
            [SceneType.GACHA]: new cc.Color(255, 240, 245),
            [SceneType.BAG]: new cc.Color(245, 245, 220),
            [SceneType.SHOP]: new cc.Color(255, 250, 205),
            [SceneType.RANK]: new cc.Color(240, 248, 255),
            [SceneType.FRIEND]: new cc.Color(240, 255, 240),
            [SceneType.SETTING]: new cc.Color(220, 220, 220),
            [SceneType.BATTLE_PASS]: new cc.Color(255, 228, 181)
        };
        return colors[sceneType] || cc.Color.WHITE;
    }
    
    /**
     * 获取场景标题
     */
    private _getSceneTitle(sceneType: SceneType): string {
        const titles = {
            [SceneType.MAIN]: '萌宠大冒险',
            [SceneType.BATTLE]: '战斗',
            [SceneType.GACHA]: '召唤萌宠',
            [SceneType.BAG]: '背包',
            [SceneType.SHOP]: '商店',
            [SceneType.RANK]: '排行榜',
            [SceneType.FRIEND]: '好友',
            [SceneType.SETTING]: '设置',
            [SceneType.BATTLE_PASS]: '战斗通行证'
        };
        return titles[sceneType] || sceneType;
    }
    
    /**
     * 初始化场景脚本
     */
    private _initSceneScript(sceneNode: cc.Node, sceneType: SceneType, data?: any): void {
        // 根据场景类型添加对应的UI脚本
        switch (sceneType) {
            case SceneType.MAIN:
                if (!sceneNode.getComponent(MainSceneUI)) {
                    sceneNode.addComponent(MainSceneUI);
                }
                break;
            case SceneType.BATTLE:
                if (!sceneNode.getComponent(BattleSceneUI)) {
                    sceneNode.addComponent(BattleSceneUI);
                }
                break;
            case SceneType.GACHA:
                if (!sceneNode.getComponent(GachaSceneUI)) {
                    sceneNode.addComponent(GachaSceneUI);
                }
                break;
            case SceneType.BAG:
                if (!sceneNode.getComponent(BagSceneUI)) {
                    sceneNode.addComponent(BagSceneUI);
                }
                break;
        }
    }
    
    /**
     * 显示Toast提示
     */
    public showToast(options: ToastOptions | string): void {
        const config: ToastOptions = typeof options === 'string' ? { message: options } : options;
        
        const toastNode = new cc.Node('Toast');
        toastNode.setContentSize(400, 80);
        
        // 背景
        const bgNode = new cc.Node('Bg');
        bgNode.setContentSize(400, 80);
        bgNode.color = new cc.Color(0, 0, 0);
        bgNode.opacity = 180;
        const bgSprite = bgNode.addComponent(cc.Sprite);
        toastNode.addChild(bgNode);
        
        // 文字
        const labelNode = new cc.Node('Label');
        const label = labelNode.addComponent(cc.Label);
        label.string = config.message;
        label.fontSize = 28;
        label.color = cc.Color.WHITE;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        labelNode.setContentSize(380, 70);
        toastNode.addChild(labelNode);
        
        // 设置位置
        const positions = {
            'top': cc.v2(0, 400),
            'center': cc.v2(0, 0),
            'bottom': cc.v2(0, -400)
        };
        toastNode.setPosition(positions[config.position || 'center']);
        
        this._toastLayer.addChild(toastNode);
        
        // 动画
        toastNode.opacity = 0;
        toastNode.scale = 0.8;
        
        cc.tween(toastNode)
            .to(0.2, { opacity: 255, scale: 1 })
            .delay(config.duration || 2)
            .to(0.3, { opacity: 0, y: toastNode.y + 50 })
            .call(() => toastNode.destroy())
            .start();
    }
    
    /**
     * 显示确认对话框
     */
    public showDialog(options: DialogOptions): void {
        this._showOverlay();
        
        const dialogNode = new cc.Node('Dialog');
        dialogNode.setContentSize(500, 300);
        
        // 背景
        const bgNode = new cc.Node('Bg');
        bgNode.setContentSize(500, 300);
        bgNode.color = new cc.Color(255, 255, 255);
        const bgSprite = bgNode.addComponent(cc.Sprite);
        dialogNode.addChild(bgNode);
        
        // 标题
        if (options.title) {
            const titleNode = new cc.Node('Title');
            const titleLabel = titleNode.addComponent(cc.Label);
            titleLabel.string = options.title;
            titleLabel.fontSize = 36;
            titleLabel.color = new cc.Color(50, 50, 50);
            titleNode.setPosition(0, 100);
            dialogNode.addChild(titleNode);
        }
        
        // 消息
        const msgNode = new cc.Node('Message');
        const msgLabel = msgNode.addComponent(cc.Label);
        msgLabel.string = options.message;
        msgLabel.fontSize = 28;
        msgLabel.color = new cc.Color(80, 80, 80);
        msgLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        msgLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        msgNode.setContentSize(450, 100);
        dialogNode.addChild(msgNode);
        
        // 确认按钮
        const confirmBtn = this._createButton(
            options.confirmText || '确定',
            new cc.Color(76, 175, 80),
            () => {
                this.closePopup(dialogNode);
                options.onConfirm?.();
            }
        );
        confirmBtn.setPosition(-100, -80);
        dialogNode.addChild(confirmBtn);
        
        // 取消按钮
        const cancelBtn = this._createButton(
            options.cancelText || '取消',
            new cc.Color(158, 158, 158),
            () => {
                this.closePopup(dialogNode);
                options.onCancel?.();
            }
        );
        cancelBtn.setPosition(100, -80);
        dialogNode.addChild(cancelBtn);
        
        this._popupLayer.addChild(dialogNode);
        this._popupStack.push(dialogNode);
        
        // 入场动画
        dialogNode.scale = 0.8;
        dialogNode.opacity = 0;
        cc.tween(dialogNode)
            .to(0.2, { scale: 1, opacity: 255 })
            .start();
    }
    
    /**
     * 创建按钮
     */
    private _createButton(text: string, color: cc.Color, callback: () => void): cc.Node {
        const btnNode = new cc.Node('Button');
        btnNode.setContentSize(140, 60);
        
        const bg = btnNode.addComponent(cc.Sprite);
        btnNode.color = color;
        
        const labelNode = new cc.Node('Label');
        const label = labelNode.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 24;
        label.color = cc.Color.WHITE;
        btnNode.addChild(labelNode);
        
        btnNode.on(cc.Node.EventType.TOUCH_END, callback);
        
        return btnNode;
    }
    
    /**
     * 显示弹窗
     */
    public showPopup(popupType: PopupType, data?: any): cc.Node {
        this._showOverlay();
        
        const popupNode = new cc.Node(popupType);
        popupNode.setContentSize(600, 500);
        
        // 这里可以根据popupType加载不同的预制体
        // 简化版本：创建基础弹窗框架
        
        this._popupLayer.addChild(popupNode);
        this._popupStack.push(popupNode);
        
        return popupNode;
    }
    
    /**
     * 关闭弹窗
     */
    public closePopup(popupNode?: cc.Node): void {
        const target = popupNode || this._popupStack.pop();
        
        if (target) {
            cc.tween(target)
                .to(0.2, { scale: 0.8, opacity: 0 })
                .call(() => {
                    target.destroy();
                    if (this._popupStack.length === 0) {
                        this._hideOverlay();
                    }
                })
                .start();
        }
    }
    
    /**
     * 关闭所有弹窗
     */
    public closeAllPopups(): void {
        while (this._popupStack.length > 0) {
            const popup = this._popupStack.pop();
            popup?.destroy();
        }
        this._hideOverlay();
    }
    
    /**
     * 显示遮罩
     */
    private _showOverlay(): void {
        this._overlayLayer.active = true;
        this._overlayLayer.opacity = 0;
        cc.tween(this._overlayLayer)
            .to(0.2, { opacity: 150 })
            .start();
    }
    
    /**
     * 隐藏遮罩
     */
    private _hideOverlay(): void {
        cc.tween(this._overlayLayer)
            .to(0.2, { opacity: 0 })
            .call(() => {
                this._overlayLayer.active = false;
            })
            .start();
    }
    
    /**
     * 获取当前场景
     */
    public getCurrentScene(): SceneType {
        return this._currentScene;
    }
    
    /**
     * 显示加载中
     */
    public showLoading(message: string = '加载中...'): void {
        const loadingNode = new cc.Node('Loading');
        loadingNode.setContentSize(cc.winSize);
        loadingNode.color = new cc.Color(0, 0, 0);
        loadingNode.opacity = 180;
        
        const labelNode = new cc.Node('Label');
        const label = labelNode.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 32;
        label.color = cc.Color.WHITE;
        loadingNode.addChild(labelNode);
        
        this._overlayLayer.addChild(loadingNode);
    }
    
    /**
     * 隐藏加载中
     */
    public hideLoading(): void {
        const loadingNode = this._overlayLayer.getChildByName('Loading');
        if (loadingNode) {
            loadingNode.destroy();
        }
    }
    
    onDestroy() {
        if (UIManager._instance === this) {
            UIManager._instance = null;
        }
    }
}