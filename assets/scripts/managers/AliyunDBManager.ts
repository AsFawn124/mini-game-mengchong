import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

/**
 * 阿里云数据库管理器
 * 负责与阿里云服务器通信，管理游戏数据
 */
@ccclass('AliyunDBManager')
export class AliyunDBManager extends Component {
    
    // 单例
    private static _instance: AliyunDBManager = null;
    public static get instance(): AliyunDBManager {
        return AliyunDBManager._instance;
    }
    
    // 阿里云服务器配置
    private readonly SERVER_URL = 'https://your-aliyun-server.com/api';
    private readonly API_KEY = 'your-api-key';
    
    // 用户数据缓存
    private userData: any = null;
    
    onLoad() {
        if (AliyunDBManager._instance === null) {
            AliyunDBManager._instance = this;
        }
    }
    
    /**
     * 用户登录/注册
     */
    async login(openid: string, userInfo?: any): Promise<any> {
        try {
            const response = await fetch(`${this.SERVER_URL}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    openid: openid,
                    nickname: userInfo?.nickName || '',
                    avatar: userInfo?.avatarUrl || '',
                    loginTime: new Date().toISOString()
                })
            });
            
            const data = await response.json();
            if (data.success) {
                this.userData = data.user;
                return data.user;
            }
            throw new Error(data.message);
        } catch (error) {
            console.error('登录失败:', error);
            // 使用本地数据作为后备
            return this.getLocalUserData(openid);
        }
    }
    
    /**
     * 获取用户数据
     */
    async getUserData(openid: string): Promise<any> {
        try {
            const response = await fetch(`${this.SERVER_URL}/user/${openid}`, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                this.userData = data.user;
                return data.user;
            }
            throw new Error(data.message);
        } catch (error) {
            console.error('获取用户数据失败:', error);
            return this.getLocalUserData(openid);
        }
    }
    
    /**
     * 保存用户数据
     */
    async saveUserData(openid: string, data: any): Promise<boolean> {
        try {
            // 先保存到本地
            this.saveLocalUserData(openid, data);
            
            // 再同步到服务器
            const response = await fetch(`${this.SERVER_URL}/user/${openid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('保存用户数据失败:', error);
            // 已保存到本地，返回成功
            return true;
        }
    }
    
    /**
     * 获取排行榜
     */
    async getLeaderboard(type: string = 'all', limit: number = 100): Promise<any[]> {
        try {
            const response = await fetch(
                `${this.SERVER_URL}/leaderboard?type=${type}&limit=${limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`
                    }
                }
            );
            
            const data = await response.json();
            if (data.success) {
                return data.leaderboard;
            }
            throw new Error(data.message);
        } catch (error) {
            console.error('获取排行榜失败:', error);
            return this.getLocalLeaderboard();
        }
    }
    
    /**
     * 提交分数
     */
    async submitScore(openid: string, score: number, wave: number, details?: any): Promise<boolean> {
        try {
            const response = await fetch(`${this.SERVER_URL}/score/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    openid: openid,
                    score: score,
                    wave: wave,
                    details: details,
                    timestamp: new Date().toISOString()
                })
            });
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('提交分数失败:', error);
            return false;
        }
    }
    
    /**
     * 获取游戏配置
     */
    async getGameConfig(): Promise<any> {
        try {
            const response = await fetch(`${this.SERVER_URL}/config`, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                return data.config;
            }
            throw new Error(data.message);
        } catch (error) {
            console.error('获取游戏配置失败:', error);
            return this.getDefaultConfig();
        }
    }
    
    /**
     * 记录游戏日志
     */
    async logEvent(openid: string, event: string, data?: any): Promise<void> {
        try {
            await fetch(`${this.SERVER_URL}/log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    openid: openid,
                    event: event,
                    data: data,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('记录日志失败:', error);
        }
    }
    
    // ==================== 本地数据后备 ====================
    
    private getLocalUserData(openid: string): any {
        const saved = localStorage.getItem(`user_${openid}`);
        if (saved) {
            return JSON.parse(saved);
        }
        
        // 创建默认用户数据
        const defaultData = {
            openid: openid,
            diamonds: 300,
            gold: 0,
            energy: 50,
            pets: [],
            bestScore: 0,
            bestWave: 0,
            createTime: new Date().toISOString()
        };
        
        this.saveLocalUserData(openid, defaultData);
        return defaultData;
    }
    
    private saveLocalUserData(openid: string, data: any): void {
        localStorage.setItem(`user_${openid}`, JSON.stringify(data));
    }
    
    private getLocalLeaderboard(): any[] {
        // 返回模拟数据
        return [];
    }
    
    private getDefaultConfig(): any {
        return {
            gachaRates: {
                N: 0.6,
                R: 0.25,
                SR: 0.12,
                SSR: 0.03
            },
            maxEnergy: 100,
            energyRecoverTime: 300
        };
    }
}