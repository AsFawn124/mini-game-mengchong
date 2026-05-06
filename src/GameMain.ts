/**
 * 游戏主入口
 * 负责游戏初始化和场景管理
 */

import { GameConfig } from './GameConfig';
import { PetManager } from './managers/PetManager';
import { BattleManager } from './managers/BattleManager';
import { AudioManager } from './managers/AudioManager';
import { WechatSDK } from './managers/WechatSDK';
import { CloudManager } from './managers/CloudManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameMain extends cc.Component {
    
    // 单例实例
    private static _instance: GameMain = null;
    public static get instance(): GameMain {
        return GameMain._instance;
    }
    
    // 管理器引用
    public petManager: PetManager = null;
    public battleManager: BattleManager = null;
    public audioManager: AudioManager = null;
    public wechatSDK: WechatSDK = null;
    public cloudManager: CloudManager = null;
    
    // 游戏状态
    private _isInitialized: boolean = false;
    private _currentScene: string = '';
    
    onLoad() {
        // 设置单例
        if (GameMain._instance === null) {
            GameMain._instance = this;
            cc.game.addPersistRootNode(this.node);
        } else {
            this.node.destroy();
            return;
        }
        
        console.log(`[GameMain] ${GameConfig.GAME_NAME} v${GameConfig.VERSION} 启动中...`);
        
        // 初始化游戏
        this.initGame();
    }
    
    /**
     * 初始化游戏
     */
    private async initGame() {
        try {
            // 1. 初始化微信SDK
            await this.initWechat();
            
            // 2. 初始化管理器
            this.initManagers();
            
            // 3. 加载用户数据
            await this.loadUserData();
            
            // 4. 初始化音频
            this.audioManager.init();
            
            this._isInitialized = true;
            console.log('[GameMain] 游戏初始化完成');
            
            // 进入主场景
            this.enterScene('MainScene');
            
        } catch (error) {
            console.error('[GameMain] 初始化失败:', error);
        }
    }
    
    /**
     * 初始化微信SDK
     */
    private async initWechat(): Promise<void> {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this.wechatSDK = new WechatSDK();
            await this.wechatSDK.init();
            
            this.cloudManager = new CloudManager();
            await this.cloudManager.init();
        } else {
            console.log('[GameMain] 非微信环境，跳过微信SDK初始化');
        }
    }
    
    /**
     * 初始化管理器
     */
    private initManagers(): void {
        // 创建管理器节点
        const managersNode = new cc.Node('Managers');
        this.node.addChild(managersNode);
        
        // 初始化各管理器
        this.petManager = managersNode.addComponent(PetManager);
        this.battleManager = managersNode.addComponent(BattleManager);
        this.audioManager = managersNode.addComponent(AudioManager);
        
        console.log('[GameMain] 管理器初始化完成');
    }
    
    /**
     * 加载用户数据
     */
    private async loadUserData(): Promise<void> {
        if (this.cloudManager) {
            const userData = await this.cloudManager.loadUserData();
            if (userData) {
                console.log('[GameMain] 用户数据加载成功');
                // 应用用户数据
            } else {
                console.log('[GameMain] 新用户，创建初始数据');
                await this.createInitialData();
            }
        } else {
            // 本地模式，创建初始数据
            this.createInitialData();
        }
    }
    
    /**
     * 创建初始数据
     */
    private async createInitialData(): Promise<void> {
        const initialData = {
            gold: 1000,
            diamond: 100,
            level: 1,
            exp: 0,
            pets: ['n001', 'n002', 'n003'],  // 初始赠送3只N级萌宠
            team: ['n001'],
            bag: []
        };
        
        if (this.cloudManager) {
            await this.cloudManager.saveUserData(initialData);
        }
        
        console.log('[GameMain] 初始数据创建完成');
    }
    
    /**
     * 切换场景
     */
    public enterScene(sceneName: string): void {
        if (this._currentScene === sceneName) return;
        
        console.log(`[GameMain] 切换场景: ${this._currentScene} -> ${sceneName}`);
        
        cc.director.loadScene(sceneName, () => {
            this._currentScene = sceneName;
            console.log(`[GameMain] 进入场景: ${sceneName}`);
        });
    }
    
    /**
     * 获取游戏是否已初始化
     */
    public get isInitialized(): boolean {
        return this._isInitialized;
    }
    
    /**
     * 获取当前场景名
     */
    public get currentScene(): string {
        return this._currentScene;
    }
    
    onDestroy() {
        if (GameMain._instance === this) {
            GameMain._instance = null;
        }
    }
}
