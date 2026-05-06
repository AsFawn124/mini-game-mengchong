/**
 * 云开发管理器
 * 负责微信云开发的数据存储、排行榜等功能
 */

import { GameConfig } from '../GameConfig';

export class CloudManager {
    
    private _isInitialized: boolean = false;
    private _db: any = null;
    private _userOpenId: string = '';
    
    /**
     * 初始化云开发
     */
    public async init(): Promise<boolean> {
        if (cc.sys.platform !== cc.sys.WECHAT_GAME) {
            console.log('[CloudManager] 非微信环境，跳过初始化');
            return false;
        }
        
        try {
            // 初始化云开发
            wx.cloud.init({
                env: GameConfig.WECHAT.ENV_ID,
                traceUser: true
            });
            
            // 获取数据库引用
            this._db = wx.cloud.database();
            
            // 获取用户openid
            const res = await wx.cloud.callFunction({
                name: 'login'
            });
            
            this._userOpenId = res.result.openid;
            this._isInitialized = true;
            
            console.log('[CloudManager] 初始化成功，用户:', this._userOpenId);
            return true;
            
        } catch (error) {
            console.error('[CloudManager] 初始化失败:', error);
            return false;
        }
    }
    
    /**
     * 加载用户数据
     */
    public async loadUserData(): Promise<any> {
        if (!this._isInitialized) return null;
        
        try {
            const res = await this._db.collection('users').doc(this._userOpenId).get();
            console.log('[CloudManager] 用户数据加载成功');
            return res.data;
        } catch (error) {
            // 用户不存在，返回null
            console.log('[CloudManager] 用户数据不存在，需要创建');
            return null;
        }
    }
    
    /**
     * 保存用户数据
     */
    public async saveUserData(data: any): Promise<boolean> {
        if (!this._isInitialized) return false;
        
        try {
            await this._db.collection('users').doc(this._userOpenId).set({
                data: {
                    ...data,
                    updateTime: this._db.serverDate()
                }
            });
            
            console.log('[CloudManager] 用户数据保存成功');
            return true;
            
        } catch (error) {
            console.error('[CloudManager] 用户数据保存失败:', error);
            return false;
        }
    }
    
    /**
     * 更新用户数据（增量更新）
     */
    public async updateUserData(data: any): Promise<boolean> {
        if (!this._isInitialized) return false;
        
        try {
            await this._db.collection('users').doc(this._userOpenId).update({
                data: {
                    ...data,
                    updateTime: this._db.serverDate()
                }
            });
            
            console.log('[CloudManager] 用户数据更新成功');
            return true;
            
        } catch (error) {
            console.error('[CloudManager] 用户数据更新失败:', error);
            return false;
        }
    }
    
    /**
     * 上传分数到排行榜
     */
    public async submitScore(score: number, wave: number): Promise<boolean> {
        if (!this._isInitialized) return false;
        
        try {
            await this._db.collection('leaderboard').add({
                data: {
                    openid: this._userOpenId,
                    score: score,
                    wave: wave,
                    createTime: this._db.serverDate()
                }
            });
            
            console.log('[CloudManager] 分数提交成功:', score);
            return true;
            
        } catch (error) {
            console.error('[CloudManager] 分数提交失败:', error);
            return false;
        }
    }
    
    /**
     * 获取排行榜
     */
    public async getLeaderboard(limit: number = 10): Promise<any[]> {
        if (!this._isInitialized) return [];
        
        try {
            const res = await this._db.collection('leaderboard')
                .orderBy('score', 'desc')
                .limit(limit)
                .get();
            
            console.log('[CloudManager] 排行榜获取成功，共', res.data.length, '条');
            return res.data;
            
        } catch (error) {
            console.error('[CloudManager] 排行榜获取失败:', error);
            return [];
        }
    }
    
    /**
     * 获取好友排行榜
     */
    public async getFriendLeaderboard(): Promise<any[]> {
        if (!this._isInitialized) return [];
        
        try {
            // 获取好友关系链数据
            const res = await wx.getFriendCloudStorage({
                keyList: ['score', 'wave']
            });
            
            // 处理好友数据
            const friends = res.data.map(item => ({
                openid: item.openid,
                nickname: item.nickname,
                avatarUrl: item.avatarUrl,
                score: item.KVDataList.find(k => k.key === 'score')?.value || 0,
                wave: item.KVDataList.find(k => k.key === 'wave')?.value || 0
            }));
            
            // 按分数排序
            friends.sort((a, b) => b.score - a.score);
            
            return friends;
            
        } catch (error) {
            console.error('[CloudManager] 好友排行榜获取失败:', error);
            return [];
        }
    }
    
    /**
     * 保存用户分数到开放域
     */
    public async saveUserScoreToOpenData(score: number, wave: number): Promise<boolean> {
        if (!this._isInitialized) return false;
        
        try {
            await wx.setUserCloudStorage({
                KVDataList: [
                    { key: 'score', value: score.toString() },
                    { key: 'wave', value: wave.toString() }
                ]
            });
            
            console.log('[CloudManager] 用户分数已保存到开放域');
            return true;
            
        } catch (error) {
            console.error('[CloudManager] 保存到开放域失败:', error);
            return false;
        }
    }
    
    /**
     * 调用云函数
     */
    public async callFunction(name: string, data?: any): Promise<any> {
        if (!this._isInitialized) return null;
        
        try {
            const res = await wx.cloud.callFunction({
                name,
                data
            });
            
            return res.result;
            
        } catch (error) {
            console.error(`[CloudManager] 云函数调用失败 [${name}]:`, error);
            return null;
        }
    }
    
    /**
     * 上传文件到云存储
     */
    public async uploadFile(cloudPath: string, filePath: string): Promise<string> {
        if (!this._isInitialized) return '';
        
        try {
            const res = await wx.cloud.uploadFile({
                cloudPath,
                filePath
            });
            
            console.log('[CloudManager] 文件上传成功:', res.fileID);
            return res.fileID;
            
        } catch (error) {
            console.error('[CloudManager] 文件上传失败:', error);
            return '';
        }
    }
    
    /**
     * 获取文件临时链接
     */
    public async getTempFileURL(fileID: string): Promise<string> {
        if (!this._isInitialized) return '';
        
        try {
            const res = await wx.cloud.getTempFileURL({
                fileList: [fileID]
            });
            
            return res.fileList[0]?.tempFileURL || '';
            
        } catch (error) {
            console.error('[CloudManager] 获取文件链接失败:', error);
            return '';
        }
    }
    
    /**
     * 获取初始化状态
     */
    public get isInitialized(): boolean {
        return this._isInitialized;
    }
    
    /**
     * 获取用户openid
     */
    public get userOpenId(): string {
        return this._userOpenId;
    }
}
