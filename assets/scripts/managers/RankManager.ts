import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

/**
 * 排行榜数据
 */
export interface RankData {
    rank: number;
    userId: string;
    nickname: string;
    avatar: string;
    score: number;
    wave: number;
    pets: number;
}

/**
 * 排行榜管理器
 * 负责排行榜数据的获取、展示和更新
 */
@ccclass('RankManager')
export class RankManager extends Component {
    
    // 单例
    private static _instance: RankManager = null;
    public static get instance(): RankManager {
        return RankManager._instance;
    }
    
    // 排行榜数据缓存
    private rankCache: {
        daily: RankData[],
        weekly: RankData[],
        allTime: RankData[],
        friends: RankData[]
    } = {
        daily: [],
        weekly: [],
        allTime: [],
        friends: []
    };
    
    // 上次更新时间
    private lastUpdateTime: number = 0;
    
    onLoad() {
        if (RankManager._instance === null) {
            RankManager._instance = this;
        }
    }
    
    /**
     * 获取排行榜数据
     */
    async getRankList(type: 'daily' | 'weekly' | 'allTime' | 'friends'): Promise<RankData[]> {
        // 检查缓存是否有效（5分钟）
        const now = Date.now();
        if (now - this.lastUpdateTime < 5 * 60 * 1000 && this.rankCache[type].length > 0) {
            return this.rankCache[type];
        }
        
        // 从服务器获取数据
        const data = await this.fetchRankFromServer(type);
        this.rankCache[type] = data;
        this.lastUpdateTime = now;
        
        return data;
    }
    
    /**
     * 从服务器获取排行榜
     */
    private async fetchRankFromServer(type: string): Promise<RankData[]> {
        // TODO: 接入微信云开发或自己的服务器
        // 模拟数据
        const mockData: RankData[] = [];
        
        for (let i = 1; i <= 100; i++) {
            mockData.push({
                rank: i,
                userId: `user_${i}`,
                nickname: `玩家${i}`,
                avatar: '',
                score: Math.floor(100000 / i),
                wave: Math.floor(1000 / i),
                pets: Math.floor(Math.random() * 40) + 1
            });
        }
        
        return mockData;
    }
    
    /**
     * 提交分数到排行榜
     */
    async submitScore(score: number, wave: number): Promise<boolean> {
        // TODO: 提交到服务器
        console.log(`提交分数: ${score}, 波数: ${wave}`);
        
        // 保存到本地记录
        const bestScore = this.getBestScore();
        if (score > bestScore) {
            localStorage.setItem('bestScore', score.toString());
            localStorage.setItem('bestWave', wave.toString());
        }
        
        return true;
    }
    
    /**
     * 获取个人最佳成绩
     */
    getBestScore(): number {
        return parseInt(localStorage.getItem('bestScore') || '0');
    }
    
    /**
     * 获取个人最佳波数
     */
    getBestWave(): number {
        return parseInt(localStorage.getItem('bestWave') || '0');
    }
    
    /**
     * 获取好友排行榜
     */
    async getFriendRankList(): Promise<RankData[]> {
        // TODO: 接入微信好友关系链
        return this.getRankList('friends');
    }
    
    /**
     * 获取世界排名
     */
    async getWorldRank(userId: string): Promise<number> {
        const allTimeRank = await this.getRankList('allTime');
        const userRank = allTimeRank.find(r => r.userId === userId);
        return userRank ? userRank.rank : -1;
    }
}