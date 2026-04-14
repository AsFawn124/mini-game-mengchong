import { _decorator, Component } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 微信云开发管理器
 * 负责数据存储、排行榜、云函数等
 */
@ccclass('CloudManager')
export class CloudManager extends Component {
    
    // 单例
    private static _instance: CloudManager = null;
    public static get instance(): CloudManager {
        return CloudManager._instance;
    }
    
    // 云开发环境ID
    private envId: string = 'your-env-id';  // 需要替换为你的环境ID
    
    // 数据库实例
    private db: any = null;
    
    // 是否初始化成功
    private isInited: boolean = false;
    
    onLoad() {
        if (CloudManager._instance === null) {
            CloudManager._instance = this;
        }
        
        this.init();
    }
    
    /**
     * 初始化云开发
     */
    private init(): void {
        if (typeof wx === 'undefined') {
            console.warn('非微信环境，跳过云开发初始化');
            return;
        }
        
        try {
            wx.cloud.init({
                env: this.envId,
                traceUser: true
            });
            
            this.db = wx.cloud.database();
            this.isInited = true;
            
            console.log('云开发初始化成功');
        } catch (err) {
            console.error('云开发初始化失败:', err);
        }
    }
    
    // ==================== 用户数据 ====================
    
    /**
     * 保存用户数据
     */
    async saveUserData(userData: any): Promise<boolean> {
        if (!this.isInited) return false;
        
        try {
            const openid = await this.getOpenId();
            if (!openid) return false;
            
            await this.db.collection('users').doc(openid).set({
                data: {
                    ...userData,
                    updateTime: this.db.serverDate()
                }
            });
            
            console.log('用户数据保存成功');
            return true;
        } catch (err) {
            console.error('用户数据保存失败:', err);
            return false;
        }
    }
    
    /**
     * 获取用户数据
     */
    async getUserData(): Promise<any> {
        if (!this.isInited) return null;
        
        try {
            const openid = await this.getOpenId();
            if (!openid) return null;
            
            const res = await this.db.collection('users').doc(openid).get();
            return res.data;
        } catch (err) {
            console.error('获取用户数据失败:', err);
            return null;
        }
    }
    
    // ==================== 排行榜 ====================
    
    /**
     * 更新排行榜分数
     */
    async updateScore(score: number, mode: string = 'endless'): Promise<boolean> {
        if (!this.isInited) return false;
        
        try {
            const openid = await this.getOpenId();
            const userInfo = await this.getUserInfo();
            
            await this.db.collection('leaderboard').add({
                data: {
                    openid: openid,
                    nickname: userInfo?.nickName || '匿名玩家',
                    avatarUrl: userInfo?.avatarUrl || '',
                    score: score,
                    mode: mode,
                    createTime: this.db.serverDate()
                }
            });
            
            console.log('排行榜分数更新成功');
            return true;
        } catch (err) {
            console.error('排行榜分数更新失败:', err);
            return false;
        }
    }
    
    /**
     * 获取排行榜
     */
    async getLeaderboard(mode: string = 'endless', limit: number = 100): Promise<any[]> {
        if (!this.isInited) return [];
        
        try {
            const res = await this.db.collection('leaderboard')
                .where({ mode: mode })
                .orderBy('score', 'desc')
                .limit(limit)
                .get();
            
            return res.data;
        } catch (err) {
            console.error('获取排行榜失败:', err);
            return [];
        }
    }
    
    /**
     * 获取好友排行榜
     */
    async getFriendLeaderboard(mode: string = 'endless'): Promise<any[]> {
        if (!this.isInited) return [];
        
        try {
            // 调用云函数获取好友排行榜
            const res = await wx.cloud.callFunction({
                name: 'getFriendLeaderboard',
                data: { mode: mode }
            });
            
            return res.result?.data || [];
        } catch (err) {
            console.error('获取好友排行榜失败:', err);
            return [];
        }
    }
    
    // ==================== 云存储 ====================
    
    /**
     * 上传文件
     */
    async uploadFile(filePath: string, cloudPath: string): Promise<string> {
        if (!this.isInited) return '';
        
        try {
            const res = await wx.cloud.uploadFile({
                cloudPath: cloudPath,
                filePath: filePath
            });
            
            console.log('文件上传成功:', res.fileID);
            return res.fileID;
        } catch (err) {
            console.error('文件上传失败:', err);
            return '';
        }
    }
    
    /**
     * 下载文件
     */
    async downloadFile(fileID: string): Promise<string> {
        if (!this.isInited) return '';
        
        try {
            const res = await wx.cloud.downloadFile({
                fileID: fileID
            });
            
            return res.tempFilePath;
        } catch (err) {
            console.error('文件下载失败:', err);
            return '';
        }
    }
    
    // ==================== 云函数 ====================
    
    /**
     * 调用云函数
     */
    async callFunction(name: string, data: any = {}): Promise<any> {
        if (!this.isInited) return null;
        
        try {
            const res = await wx.cloud.callFunction({
                name: name,
                data: data
            });
            
            return res.result;
        } catch (err) {
            console.error('云函数调用失败:', err);
            return null;
        }
    }
    
    // ==================== 辅助方法 ====================
    
    /**
     * 获取OpenID
     */
    private async getOpenId(): Promise<string> {
        try {
            const res = await wx.cloud.callFunction({
                name: 'getOpenId'
            });
            return res.result?.openid || '';
        } catch (err) {
            console.error('获取OpenID失败:', err);
            return '';
        }
    }
    
    /**
     * 获取用户信息
     */
    private async getUserInfo(): Promise<any> {
        try {
            const res = await wx.getUserInfo();
            return res.userInfo;
        } catch (err) {
            return null;
        }
    }
    
    /**
     * 设置环境ID
     */
    setEnvId(envId: string): void {
        this.envId = envId;
    }
}