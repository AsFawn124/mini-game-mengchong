/**
 * 微信SDK封装
 * 负责微信小游戏的登录、分享、广告等功能
 */

import { GameConfig } from '../GameConfig';

export class WechatSDK {
    
    private _isInitialized: boolean = false;
    private _userInfo: any = null;
    private _systemInfo: any = null;
    
    /**
     * 初始化微信SDK
     */
    public async init(): Promise<boolean> {
        if (cc.sys.platform !== cc.sys.WECHAT_GAME) {
            console.log('[WechatSDK] 非微信环境，跳过初始化');
            return false;
        }
        
        try {
            // 获取系统信息
            this._systemInfo = wx.getSystemInfoSync();
            console.log('[WechatSDK] 系统信息:', this._systemInfo);
            
            // 检查更新
            this._checkUpdate();
            
            // 显示分享菜单
            wx.showShareMenu({
                withShareTicket: true,
                menus: ['shareAppMessage', 'shareTimeline']
            });
            
            // 设置分享回调
            wx.onShareAppMessage(() => {
                return this._getShareData();
            });
            
            this._isInitialized = true;
            console.log('[WechatSDK] 初始化成功');
            return true;
            
        } catch (error) {
            console.error('[WechatSDK] 初始化失败:', error);
            return false;
        }
    }
    
    /**
     * 微信登录
     */
    public async login(): Promise<any> {
        if (!this._isInitialized) {
            console.error('[WechatSDK] SDK未初始化');
            return null;
        }
        
        try {
            const res = await wx.login();
            console.log('[WechatSDK] 登录成功:', res.code);
            return res;
        } catch (error) {
            console.error('[WechatSDK] 登录失败:', error);
            return null;
        }
    }
    
    /**
     * 获取用户信息
     */
    public async getUserInfo(): Promise<any> {
        if (!this._isInitialized) return null;
        
        try {
            const res = await wx.getUserProfile({
                desc: '用于完善用户资料'
            });
            
            this._userInfo = res.userInfo;
            console.log('[WechatSDK] 获取用户信息成功:', this._userInfo.nickName);
            return this._userInfo;
            
        } catch (error) {
            console.error('[WechatSDK] 获取用户信息失败:', error);
            return null;
        }
    }
    
    /**
     * 分享游戏
     */
    public share(title?: string, imageUrl?: string): void {
        if (!this._isInitialized) return;
        
        const shareData = this._getShareData(title, imageUrl);
        wx.shareAppMessage(shareData);
    }
    
    /**
     * 显示激励视频广告
     */
    public async showRewardedVideoAd(adUnitId: string): Promise<boolean> {
        if (!this._isInitialized) return false;
        
        return new Promise((resolve) => {
            const rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId });
            
            rewardedVideoAd.onLoad(() => {
                console.log('[WechatSDK] 激励视频广告加载成功');
            });
            
            rewardedVideoAd.onError((err) => {
                console.error('[WechatSDK] 激励视频广告错误:', err);
                resolve(false);
            });
            
            rewardedVideoAd.onClose((res) => {
                if (res && res.isEnded) {
                    console.log('[WechatSDK] 激励视频播放完成');
                    resolve(true);
                } else {
                    console.log('[WechatSDK] 激励视频提前关闭');
                    resolve(false);
                }
            });
            
            rewardedVideoAd.show().catch(() => {
                rewardedVideoAd.load().then(() => rewardedVideoAd.show());
            });
        });
    }
    
    /**
     * 显示Banner广告
     */
    public createBannerAd(adUnitId: string, style?: any): any {
        if (!this._isInitialized) return null;
        
        const bannerAd = wx.createBannerAd({
            adUnitId,
            style: style || {
                left: 0,
                top: this._systemInfo.screenHeight - 100,
                width: this._systemInfo.screenWidth
            }
        });
        
        bannerAd.onError((err) => {
            console.error('[WechatSDK] Banner广告错误:', err);
        });
        
        return bannerAd;
    }
    
    /**
     * 显示插屏广告
     */
    public async showInterstitialAd(adUnitId: string): Promise<boolean> {
        if (!this._isInitialized) return false;
        
        try {
            const interstitialAd = wx.createInterstitialAd({ adUnitId });
            await interstitialAd.show();
            return true;
        } catch (error) {
            console.error('[WechatSDK] 插屏广告显示失败:', error);
            return false;
        }
    }
    
    /**
     * 发起支付
     */
    public async requestPayment(orderInfo: any): Promise<any> {
        if (!this._isInitialized) return null;
        
        try {
            const res = await wx.requestMidasPayment({
                mode: 'game',
                env: 0,
                offerId: orderInfo.offerId,
                currencyType: 'CNY',
                platform: 'android',
                buyQuantity: orderInfo.quantity,
                zoneId: '1'
            });
            
            console.log('[WechatSDK] 支付成功:', res);
            return res;
            
        } catch (error) {
            console.error('[WechatSDK] 支付失败:', error);
            return null;
        }
    }
    
    /**
     * 创建朋友圈按钮
     */
    public createGameClubButton(style?: any): any {
        if (!this._isInitialized) return null;
        
        const button = wx.createGameClubButton({
            icon: 'green',
            style: style || {
                left: 10,
                top: 50,
                width: 40,
                height: 40
            }
        });
        
        return button;
    }
    
    /**
     * 打开客服会话
     */
    public openCustomerService(): void {
        if (!this._isInitialized) return;
        
        wx.openCustomerServiceConversation({
            sessionFrom: 'game',
            showMessageCard: true,
            sendMessageTitle: '萌宠大冒险客服',
            sendMessagePath: 'pages/index/index',
            sendMessageImg: ''
        });
    }
    
    /**
     * 设置帧率
     */
    public setFrameRate(fps: number): void {
        if (!this._isInitialized) return;
        
        wx.setPreferredFramesPerSecond(fps);
    }
    
    /**
     * 保持屏幕常亮
     */
    public keepScreenOn(): void {
        if (!this._isInitialized) return;
        
        wx.setKeepScreenOn({ keepScreenOn: true });
    }
    
    /**
     * 振动
     */
    public vibrateShort(): void {
        if (!this._isInitialized) return;
        
        wx.vibrateShort({ type: 'light' });
    }
    
    /**
     * 检查更新
     */
    private _checkUpdate(): void {
        if (typeof wx.getUpdateManager === 'function') {
            const updateManager = wx.getUpdateManager();
            
            updateManager.onCheckForUpdate((res) => {
                console.log('[WechatSDK] 检查更新:', res.hasUpdate);
            });
            
            updateManager.onUpdateReady(() => {
                wx.showModal({
                    title: '更新提示',
                    content: '新版本已准备好，是否重启应用？',
                    success: (res) => {
                        if (res.confirm) {
                            updateManager.applyUpdate();
                        }
                    }
                });
            });
        }
    }
    
    /**
     * 获取分享数据
     */
    private _getShareData(title?: string, imageUrl?: string): any {
        const shareTitles = [
            '快来和我一起收集萌宠吧！',
            '我抽到了SSR萌宠，你也来试试！',
            '这款萌宠游戏太治愈了，推荐给你！',
            '挑战无尽关卡，你能走多远？'
        ];
        
        return {
            title: title || shareTitles[Math.floor(Math.random() * shareTitles.length)],
            imageUrl: imageUrl || '',
            query: 'inviter=' + (this._userInfo?.openId || '')
        };
    }
    
    /**
     * 获取初始化状态
     */
    public get isInitialized(): boolean {
        return this._isInitialized;
    }
    
    /**
     * 获取用户信息
     */
    public get userInfo(): any {
        return this._userInfo;
    }
    
    /**
     * 获取系统信息
     */
    public get systemInfo(): any {
        return this._systemInfo;
    }
}
