import { _decorator, Component } from 'cc';
import { AliyunDBManager } from './AliyunDBManager';

const { ccclass } = _decorator;

/**
 * 用户完整数据接口
 */
export interface UserData {
    // 基本信息
    openid: string;
    nickname: string;
    avatar: string;
    gender: number;
    country: string;
    province: string;
    city: string;
    
    // 游戏资源
    diamonds: number;
    gold: number;
    energy: number;
    energyLastUpdate: number;
    
    // 等级经验
    level: number;
    exp: number;
    
    // 游戏统计
    bestScore: number;
    bestWave: number;
    totalGames: number;
    totalWins: number;
    
    // 抽卡统计
    totalGacha: number;
    gachaPitySR: number;
    gachaPitySSR: number;
    
    // 战令数据
    battlePassLevel: number;
    battlePassExp: number;
    battlePassPremium: boolean;
    battlePassClaimed: number[];
    
    // 登录统计
    loginDays: number;
    lastLoginDate: string;
    consecutiveLoginDays: number;
    
    // 时间戳
    createTime: string;
    updateTime: string;
    lastLoginTime: string;
}

/**
 * 用户数据管理器
 * 管理用户完整数据，支持本地缓存和服务器同步
 */
@ccclass('UserDataManager')
export class UserDataManager extends Component {
    
    // 单例
    private static _instance: UserDataManager = null;
    public static get instance(): UserDataManager {
        return UserDataManager._instance;
    }
    
    // 当前用户数据
    private userData: UserData = null;
    
    // 数据是否已同步
    private isSynced: boolean = false;
    
    // 自动保存定时器
    private autoSaveTimer: number = null;
    
    onLoad() {
        if (UserDataManager._instance === null) {
            UserDataManager._instance = this;
        }
        this.startAutoSave();
    }
    
    onDestroy() {
        this.stopAutoSave();
    }
    
    /**
     * 初始化用户数据
     */
    async initUser(openid: string, userInfo?: any): Promise<UserData> {
        // 尝试从服务器获取
        try {
            const serverData = await AliyunDBManager.instance.getUserData(openid);
            if (serverData) {
                this.userData = this.convertToUserData(serverData);
                this.isSynced = true;
                this.saveLocal();
                return this.userData;
            }
        } catch (error) {
            console.log('从服务器获取失败，使用本地数据');
        }
        
        // 尝试从本地加载
        const localData = this.loadLocal();
        if (localData && localData.openid === openid) {
            this.userData = localData;
            return this.userData;
        }
        
        // 创建新用户
        this.userData = this.createDefaultUser(openid, userInfo);
        await this.syncToServer();
        return this.userData;
    }
    
    /**
     * 创建默认用户数据
     */
    private createDefaultUser(openid: string, userInfo?: any): UserData {
        const now = new Date().toISOString();
        return {
            openid: openid,
            nickname: userInfo?.nickName || '',
            avatar: userInfo?.avatarUrl || '',
            gender: userInfo?.gender || 0,
            country: userInfo?.country || '',
            province: userInfo?.province || '',
            city: userInfo?.city || '',
            
            diamonds: 300,
            gold: 0,
            energy: 50,
            energyLastUpdate: Date.now(),
            
            level: 1,
            exp: 0,
            
            bestScore: 0,
            bestWave: 0,
            totalGames: 0,
            totalWins: 0,
            
            totalGacha: 0,
            gachaPitySR: 0,
            gachaPitySSR: 0,
            
            battlePassLevel: 1,
            battlePassExp: 0,
            battlePassPremium: false,
            battlePassClaimed: [],
            
            loginDays: 0,
            lastLoginDate: '',
            consecutiveLoginDays: 0,
            
            createTime: now,
            updateTime: now,
            lastLoginTime: now
        };
    }
    
    /**
     * 转换服务器数据为本地格式
     */
    private convertToUserData(serverData: any): UserData {
        return {
            openid: serverData.openid,
            nickname: serverData.nickname || '',
            avatar: serverData.avatar || '',
            gender: serverData.gender || 0,
            country: serverData.country || '',
            province: serverData.province || '',
            city: serverData.city || '',
            
            diamonds: serverData.diamonds || 300,
            gold: serverData.gold || 0,
            energy: serverData.energy || 50,
            energyLastUpdate: Date.now(),
            
            level: serverData.level || 1,
            exp: serverData.exp || 0,
            
            bestScore: serverData.best_score || 0,
            bestWave: serverData.best_wave || 0,
            totalGames: serverData.total_games || 0,
            totalWins: serverData.total_wins || 0,
            
            totalGacha: serverData.total_gacha || 0,
            gachaPitySR: serverData.gacha_pity_sr || 0,
            gachaPitySSR: serverData.gacha_pity_ssr || 0,
            
            battlePassLevel: serverData.battle_pass_level || 1,
            battlePassExp: serverData.battle_pass_exp || 0,
            battlePassPremium: !!serverData.battle_pass_premium,
            battlePassClaimed: JSON.parse(serverData.battle_pass_claimed || '[]'),
            
            loginDays: serverData.login_days || 0,
            lastLoginDate: serverData.last_login_date || '',
            consecutiveLoginDays: serverData.consecutive_login_days || 0,
            
            createTime: serverData.create_time,
            updateTime: serverData.update_time,
            lastLoginTime: serverData.last_login_time
        };
    }
    
    /**
     * 获取用户数据
     */
    getUserData(): UserData {
        return this.userData;
    }
    
    /**
     * 更新用户数据
     */
    updateUserData(updates: Partial<UserData>): void {
        if (!this.userData) return;
        
        Object.assign(this.userData, updates);
        this.userData.updateTime = new Date().toISOString();
        this.isSynced = false;
    }
    
    /**
     * 增加资源
     */
    addResource(type: 'diamonds' | 'gold' | 'energy', amount: number): void {
        if (!this.userData) return;
        
        this.userData[type] += amount;
        this.isSynced = false;
    }
    
    /**
     * 消耗资源
     */
    consumeResource(type: 'diamonds' | 'gold' | 'energy', amount: number): boolean {
        if (!this.userData) return false;
        
        if (this.userData[type] < amount) {
            return false;
        }
        
        this.userData[type] -= amount;
        this.isSynced = false;
        return true;
    }
    
    /**
     * 增加经验
     */
    addExp(amount: number): void {
        if (!this.userData) return;
        
        this.userData.exp += amount;
        
        // 检查升级
        while (this.userData.exp >= this.getRequiredExp()) {
            this.userData.exp -= this.getRequiredExp();
            this.userData.level++;
        }
        
        this.isSynced = false;
    }
    
    /**
     * 获取升级所需经验
     */
    private getRequiredExp(): number {
        if (!this.userData) return 100;
        return Math.floor(100 * Math.pow(1.2, this.userData.level - 1));
    }
    
    /**
     * 同步到服务器
     */
    async syncToServer(): Promise<boolean> {
        if (!this.userData || this.isSynced) return true;
        
        try {
            const success = await AliyunDBManager.instance.saveUserData(
                this.userData.openid,
                this.userData
            );
            
            if (success) {
                this.isSynced = true;
                this.saveLocal();
            }
            
            return success;
        } catch (error) {
            console.error('同步到服务器失败:', error);
            return false;
        }
    }
    
    /**
     * 保存到本地
     */
    private saveLocal(): void {
        if (!this.userData) return;
        
        localStorage.setItem('userData', JSON.stringify(this.userData));
        localStorage.setItem('userDataTime', Date.now().toString());
    }
    
    /**
     * 从本地加载
     */
    private loadLocal(): UserData | null {
        const saved = localStorage.getItem('userData');
        if (!saved) return null;
        
        try {
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    }
    
    /**
     * 开始自动保存
     */
    private startAutoSave(): void {
        this.autoSaveTimer = window.setInterval(() => {
            if (!this.isSynced) {
                this.syncToServer();
            }
        }, 30000); // 30秒自动保存一次
    }
    
    /**
     * 停止自动保存
     */
    private stopAutoSave(): void {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
    
    /**
     * 处理每日登录
     */
    handleDailyLogin(): { isNewDay: boolean; consecutiveDays: number; rewards: any[] } {
        if (!this.userData) {
            return { isNewDay: false, consecutiveDays: 0, rewards: [] };
        }
        
        const today = new Date().toDateString();
        const lastDate = this.userData.lastLoginDate;
        
        if (today === lastDate) {
            return { isNewDay: false, consecutiveDays: this.userData.consecutiveLoginDays, rewards: [] };
        }
        
        // 新的一天
        this.userData.loginDays++;
        this.userData.lastLoginDate = today;
        
        // 检查连续登录
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate === yesterday.toDateString()) {
            this.userData.consecutiveLoginDays++;
        } else {
            this.userData.consecutiveLoginDays = 1;
        }
        
        // 计算登录奖励
        const rewards = this.calculateLoginRewards();
        
        this.isSynced = false;
        this.syncToServer();
        
        return {
            isNewDay: true,
            consecutiveDays: this.userData.consecutiveLoginDays,
            rewards
        };
    }
    
    /**
     * 计算登录奖励
     */
    private calculateLoginRewards(): any[] {
        const rewards = [];
        const days = this.userData.consecutiveLoginDays;
        
        // 基础奖励
        rewards.push({ type: 'diamond', amount: 10 });
        
        // 连续登录奖励
        if (days % 7 === 0) {
            rewards.push({ type: 'diamond', amount: 100 });
            rewards.push({ type: 'gacha_ticket', amount: 1 });
        } else if (days % 3 === 0) {
            rewards.push({ type: 'diamond', amount: 30 });
        }
        
        return rewards;
    }
}