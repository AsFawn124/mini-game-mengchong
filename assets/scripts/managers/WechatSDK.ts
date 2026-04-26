import { _decorator, Component, director } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 微信SDK管理器
 * 封装微信小游戏的API调用
 */
@ccclass('WechatSDK')
export class WechatSDK extends Component {
    
    // 单例
    private static _instance: WechatSDK = null;
    public static get instance(): WechatSDK {
        return WechatSDK._instance;
    }
    
    // 小程序AppID
    public static readonly APPID: string = 'wx8e1435739bbdf94d';
    
    // 云开发环境ID（需要替换为实际的）
    public static readonly CLOUD_ENV: string = 'your-cloud-env-id';
    
    // 广告单元ID（需要替换为实际的）
    public static readonly AD_REWARDED: string = 'adunit-rewarded-video-id';
    public static readonly AD_BANNER: string = 'adunit-banner-id';
    
    // 用户信息
    private userInfo: any = null;
    
    // 登录凭证
    private code: string = '';
    
    // OpenID
    private openid: string = '';
    
    // 是否初始化成功
    private isInited: boolean = false;
    
    // 云开发是否初始化
    private isCloudInited: boolean = false;
    
    onLoad() {
        if (WechatSDK._instance === null) {
            WechatSDK._instance = this;
        }
        
        this.init();
    }
    
    /**
     * 初始化微信SDK
     */
    private init(): void {
        if (typeof wx === 'undefined') {
            console.warn('非微信环境，跳过微信SDK初始化');
            return;
        }
        
        // 初始化云开发
        this.initCloud();
        
        // 展示分享菜单
        this.showShareMenu();
        
        // 监听分享事件
        this.onShareAppMessage();
        
        // 监听显示/隐藏
        this.onShowHide();
        
        this.isInited = true;
        console.log('微信SDK初始化成功，AppID:', WechatSDK.APPID);
    }
    
    /**
     * 初始化云开发
     */
    private initCloud(): void {
        if (typeof wx === 'undefined') return;
        
        try {
            wx.cloud.init({
                env: WechatSDK.CLOUD_ENV,
                traceUser: true
            });
            this.isCloudInited = true;
            console.log('云开发初始化成功');
        } catch (err) {
            console.error('云开发初始化失败:', err);
        }
    }
    
    /**
     * 调用云函数
     */
    async callCloudFunction(name: string, data?: any): Promise<any> {
        if (typeof wx === 'undefined' || !this.isCloudInited) {
            throw new Error('云开发未初始化');
        }
        
        try {
            const res = await wx.cloud.callFunction({
                name: name,
                data: data
            });
            return res.result;
        } catch (err) {
            console.error('云函数调用失败:', err);
            throw err;
        }
    }
    
    /**
     * 获取数据库引用
     */
    getDatabase(): any {
        if (typeof wx === 'undefined' || !this.isCloudInited) {
            return null;
        }
        return wx.cloud.database();
    }
    
    // ==================== 登录相关 ====================
    
    /**
     * 微信登录
     */
    login(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (typeof wx === 'undefined') {
                reject('非微信环境');
                return;
            }
            
            wx.login({
                success: (res) => {
                    this.code = res.code;
                    console.log('微信登录成功:', res.code);
                    resolve(res);
                },
                fail: (err) => {
                    console.error('微信登录失败:', err);
                    reject(err);
                }
            });
        });
    }
    
    /**
     * 获取用户信息
     */
    getUserInfo(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (typeof wx === 'undefined') {
                reject('非微信环境');
                return;
            }
            
            wx.getUserInfo({
                withCredentials: true,
                success: (res) => {
                    this.userInfo = res.userInfo;
                    console.log('获取用户信息成功:', res.userInfo);
                    resolve(res);
                },
                fail: (err) => {
                    console.error('获取用户信息失败:', err);
                    reject(err);
                }
            });
        });
    }
    
    /**
     * 创建用户信息按钮
     */
    createUserInfoButton(): any {
        if (typeof wx === 'undefined') return null;
        
        const button = wx.createUserInfoButton({
            type: 'text',
            text: '获取用户信息',
            style: {
                left: 275,
                top: 600,
                width: 200,
                height: 80,
                lineHeight: 80,
                backgroundColor: '#FF9A9E',
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 28,
                borderRadius: 40
            }
        });
        
        button.onTap((res) => {
            if (res.userInfo) {
                this.userInfo = res.userInfo;
                console.log('用户授权成功:', res.userInfo);
                button.destroy();
            }
        });
        
        return button;
    }
    
    // ==================== 分享相关 ====================
    
    /**
     * 显示分享菜单
     */
    private showShareMenu(): void {
        if (typeof wx === 'undefined') return;
        
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        });
    }
    
    /**
     * 监听分享事件
     */
    private onShareAppMessage(): void {
        if (typeof wx === 'undefined') return;
        
        wx.onShareAppMessage(() => {
            return {
                title: '萌宠大冒险 - 快来收集你的专属萌宠！',
                imageUrl: 'https://your-cdn.com/share-image.jpg',
                query: 'inviter=' + (this.userInfo?.openid || '')
            };
        });
    }
    
    /**
     * 主动分享
     */
    shareAppMessage(title?: string, imageUrl?: string, query?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (typeof wx === 'undefined') {
                reject('非微信环境');
                return;
            }
            
            wx.shareAppMessage({
                title: title || '萌宠大冒险 - 快来收集你的专属萌宠！',
                imageUrl: imageUrl || 'https://your-cdn.com/share-image.jpg',
                query: query || '',
                success: (res) => {
                    console.log('分享成功:', res);
                    resolve(res);
                },
                fail: (err) => {
                    console.error('分享失败:', err);
                    reject(err);
                }
            });
        });
    }
    
    // ==================== 广告相关 ====================
    
    /**
     * 创建激励视频广告
     */
    createRewardedVideoAd(adUnitId?: string): any {
        if (typeof wx === 'undefined') return null;
        
        const rewardedVideoAd = wx.createRewardedVideoAd({
            adUnitId: adUnitId || WechatSDK.AD_REWARDED
        });
        
        rewardedVideoAd.onLoad(() => {
            console.log('激励视频广告加载成功');
        });
        
        rewardedVideoAd.onError((err) => {
            console.error('激励视频广告加载失败:', err);
        });
        
        return rewardedVideoAd;
    }
    
    /**
     * 显示激励视频广告
     */
    showRewardedVideoAd(adUnitId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (typeof wx === 'undefined') {
                reject('非微信环境');
                return;
            }
            
            const rewardedVideoAd = this.createRewardedVideoAd(adUnitId);
            if (!rewardedVideoAd) {
                reject('广告创建失败');
                return;
            }
            
            rewardedVideoAd.show().catch(() => {
                rewardedVideoAd.load().then(() => {
                    rewardedVideoAd.show();
                }).catch(err => {
                    console.error('广告加载失败:', err);
                    reject(err);
                });
            });
            
            rewardedVideoAd.onClose((res) => {
                if (res && res.isEnded) {
                    console.log('广告播放完成，发放奖励');
                    resolve(true);
                } else {
                    console.log('广告未播放完成');
                    resolve(false);
                }
            });
        });
    }
    
    /**
     * 创建Banner广告
     */
    createBannerAd(adUnitId?: string): any {
        if (typeof wx === 'undefined') return null;
        
        const bannerAd = wx.createBannerAd({
            adUnitId: adUnitId || WechatSDK.AD_BANNER,
            style: {
                left: 0,
                top: 0,
                width: 750
            }
        });
        
        bannerAd.onLoad(() => {
            console.log('Banner广告加载成功');
        });
        
        bannerAd.onError((err) => {
            console.error('Banner广告加载失败:', err);
        });
        
        return bannerAd;
    }
    
    // ==================== 生命周期 ====================
    
    /**
     * 监听显示/隐藏
     */
    private onShowHide(): void {
        if (typeof wx === 'undefined') return;
        
        wx.onShow((res) => {
            console.log('游戏显示:', res);
            // 恢复游戏
            director.resume();
        });
        
        wx.onHide(() => {
            console.log('游戏隐藏');
            // 暂停游戏
            director.pause();
            // 保存数据
            this.saveGameData();
        });
    }
    
    /**
     * 保存游戏数据
     */
    private saveGameData(): void {
        // TODO: 调用云开发保存数据
        console.log('保存游戏数据');
    }
    
    // ==================== 设备信息 ====================
    
    /**
     * 获取系统信息
     */
    getSystemInfo(): any {
        if (typeof wx === 'undefined') return null;
        
        return wx.getSystemInfoSync();
    }
    
    /**
     * 获取启动参数
     */
    getLaunchOptions(): any {
        if (typeof wx === 'undefined') return null;
        
        return wx.getLaunchOptionsSync();
    }
    
    // ==================== 振动反馈 ====================
    
    /**
     * 短振动
     */
    vibrateShort(): void {
        if (typeof wx === 'undefined') return;
        
        wx.vibrateShort({
            type: 'light'
        });
    }
    
    /**
     * 长振动
     */
    vibrateLong(): void {
        if (typeof wx === 'undefined') return;
        
        wx.vibrateLong();
    }
    
    // ==================== 获取实例 ====================
    
    /**
     * 获取用户信息
     */
    getUserInfoData(): any {
        return this.userInfo;
    }
    
    /**
     * 获取登录code
     */
    getLoginCode(): string {
        return this.code;
    }
    
    /**
     * 是否初始化成功
     */
    getIsInited(): boolean {
        return this.isInited;
    }
}