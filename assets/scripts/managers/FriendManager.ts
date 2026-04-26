import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

/**
 * 好友数据
 */
export interface FriendData {
    userId: string;
    nickname: string;
    avatar: string;
    isOnline: boolean;
    lastLogin: number;
    bestScore: number;
    bestWave: number;
    canSendEnergy: boolean;
    canReceiveEnergy: boolean;
}

/**
 * 好友管理器
 * 负责好友系统、组队功能
 */
@ccclass('FriendManager')
export class FriendManager extends Component {
    
    // 单例
    private static _instance: FriendManager = null;
    public static get instance(): FriendManager {
        return FriendManager._instance;
    }
    
    // 好友列表
    private friendList: FriendData[] = [];
    
    // 组队数据
    private teamMembers: string[] = [];
    private isInTeam: boolean = false;
    private teamId: string = '';
    
    onLoad() {
        if (FriendManager._instance === null) {
            FriendManager._instance = this;
        }
    }
    
    /**
     * 获取好友列表
     */
    async getFriendList(): Promise<FriendData[]> {
        // TODO: 从微信好友关系链获取
        // 模拟数据
        if (this.friendList.length === 0) {
            this.friendList = this.generateMockFriends();
        }
        return this.friendList;
    }
    
    /**
     * 生成模拟好友数据
     */
    private generateMockFriends(): FriendData[] {
        const friends: FriendData[] = [];
        for (let i = 1; i <= 20; i++) {
            friends.push({
                userId: `friend_${i}`,
                nickname: `好友${i}`,
                avatar: '',
                isOnline: Math.random() > 0.5,
                lastLogin: Date.now() - Math.floor(Math.random() * 86400000),
                bestScore: Math.floor(Math.random() * 100000),
                bestWave: Math.floor(Math.random() * 500),
                canSendEnergy: true,
                canReceiveEnergy: Math.random() > 0.5
            });
        }
        return friends;
    }
    
    /**
     * 赠送体力给好友
     */
    async sendEnergy(friendId: string): Promise<boolean> {
        // TODO: 调用微信接口或服务器
        console.log(`赠送体力给好友: ${friendId}`);
        
        const friend = this.friendList.find(f => f.userId === friendId);
        if (friend) {
            friend.canSendEnergy = false;
        }
        
        return true;
    }
    
    /**
     * 接收好友赠送的体力
     */
    async receiveEnergy(friendId: string): Promise<number> {
        // TODO: 调用服务器接口
        console.log(`接收好友${friendId}的体力`);
        
        const friend = this.friendList.find(f => f.userId === friendId);
        if (friend) {
            friend.canReceiveEnergy = false;
        }
        
        return 5; // 每次接收5点体力
    }
    
    /**
     * 邀请好友组队
     */
    async inviteTeam(friendId: string): Promise<boolean> {
        if (this.isInTeam) {
            console.log('已经在队伍中');
            return false;
        }
        
        // TODO: 发送组队邀请
        console.log(`邀请好友${friendId}组队`);
        return true;
    }
    
    /**
     * 创建队伍
     */
    async createTeam(): Promise<string> {
        this.teamId = `team_${Date.now()}`;
        this.isInTeam = true;
        this.teamMembers = ['self'];
        
        console.log(`创建队伍: ${this.teamId}`);
        return this.teamId;
    }
    
    /**
     * 加入队伍
     */
    async joinTeam(teamId: string): Promise<boolean> {
        // TODO: 验证队伍是否存在
        this.teamId = teamId;
        this.isInTeam = true;
        this.teamMembers.push('self');
        
        console.log(`加入队伍: ${teamId}`);
        return true;
    }
    
    /**
     * 离开队伍
     */
    async leaveTeam(): Promise<void> {
        this.teamId = '';
        this.isInTeam = false;
        this.teamMembers = [];
        
        console.log('离开队伍');
    }
    
    /**
     * 获取队伍成员
     */
    getTeamMembers(): string[] {
        return this.teamMembers;
    }
    
    /**
     * 是否在游戏中
     */
    isInGameTeam(): boolean {
        return this.isInTeam;
    }
    
    /**
     * 分享邀请链接
     */
    async shareInvite(): Promise<void> {
        // TODO: 调用微信分享接口
        console.log('分享组队邀请');
    }
}