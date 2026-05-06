/**
 * 好友管理器
 * 管理好友系统、好友互动、好友助战等功能
 */

import GameMain from '../GameMain';
import { CloudManager } from './CloudManager';
import { EventManager } from '../utils/GameUtils';

const { ccclass } = cc._decorator;

export interface Friend {
    openid: string;
    nickname: string;
    avatarUrl: string;
    level: number;
    lastLoginTime: number;
    isOnline: boolean;
    canSendEnergy: boolean;
    canReceiveEnergy: boolean;
    battlePower: number;
    mainPet: string;
}

export interface FriendRequest {
    id: string;
    fromOpenid: string;
    fromNickname: string;
    fromAvatar: string;
    createTime: number;
    status: 'pending' | 'accepted' | 'rejected';
}

@ccclass
export class FriendManager extends cc.Component {
    
    private _friends: Map<string, Friend> = new Map();
    private _friendRequests: FriendRequest[] = [];
    private _maxFriends: number = 50;
    private _energySendLimit: number = 20;
    private _energyReceiveLimit: number = 20;
    
    onLoad() {
        console.log('[FriendManager] 初始化');
        this._loadFriends();
    }
    
    /**
     * 搜索好友
     */
    public async searchFriend(keyword: string): Promise<Friend[]> {
        if (!GameMain.instance?.cloudManager) return [];
        
        try {
            const db = (GameMain.instance.cloudManager as any)._db;
            const result = await db.collection('users')
                .where({
                    nickname: db.RegExp({
                        regexp: keyword,
                        options: 'i'
                    })
                })
                .limit(10)
                .get();
            
            return result.data.map((user: any) => ({
                openid: user._openid,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                level: user.level || 1,
                lastLoginTime: user.lastLoginTime || Date.now(),
                isOnline: false,
                canSendEnergy: true,
                canReceiveEnergy: false,
                battlePower: user.battlePower || 0,
                mainPet: user.mainPet || ''
            }));
        } catch (error) {
            console.error('[FriendManager] 搜索好友失败:', error);
            return [];
        }
    }
    
    /**
     * 发送好友请求
     */
    public async sendFriendRequest(targetOpenid: string): Promise<boolean> {
        if (!GameMain.instance?.cloudManager) return false;
        
        // 检查是否已经是好友
        if (this._friends.has(targetOpenid)) {
            console.log('[FriendManager] 已经是好友');
            return false;
        }
        
        // 检查好友数量
        if (this._friends.size >= this._maxFriends) {
            console.log('[FriendManager] 好友数量已达上限');
            return false;
        }
        
        try {
            const db = (GameMain.instance.cloudManager as any)._db;
            await db.collection('friend_requests').add({
                data: {
                    fromOpenid: GameMain.instance.cloudManager.userOpenId,
                    toOpenid: targetOpenid,
                    status: 'pending',
                    createTime: db.serverDate()
                }
            });
            
            console.log('[FriendManager] 好友请求已发送');
            return true;
        } catch (error) {
            console.error('[FriendManager] 发送好友请求失败:', error);
            return false;
        }
    }
    
    /**
     * 获取好友请求列表
     */
    public async getFriendRequests(): Promise<FriendRequest[]> {
        if (!GameMain.instance?.cloudManager) return [];
        
        try {
            const db = (GameMain.instance.cloudManager as any)._db;
            const result = await db.collection('friend_requests')
                .where({
                    toOpenid: GameMain.instance.cloudManager.userOpenId,
                    status: 'pending'
                })
                .orderBy('createTime', 'desc')
                .get();
            
            this._friendRequests = result.data.map((req: any) => ({
                id: req._id,
                fromOpenid: req.fromOpenid,
                fromNickname: req.fromNickname || '未知玩家',
                fromAvatar: req.fromAvatar || '',
                createTime: req.createTime,
                status: req.status
            }));
            
            return this._friendRequests;
        } catch (error) {
            console.error('[FriendManager] 获取好友请求失败:', error);
            return [];
        }
    }
    
    /**
     * 处理好友请求
     */
    public async handleFriendRequest(requestId: string, accept: boolean): Promise<boolean> {
        if (!GameMain.instance?.cloudManager) return false;
        
        try {
            const db = (GameMain.instance.cloudManager as any)._db;
            
            // 更新请求状态
            await db.collection('friend_requests').doc(requestId).update({
                data: {
                    status: accept ? 'accepted' : 'rejected',
                    handleTime: db.serverDate()
                }
            });
            
            if (accept) {
                // 获取请求信息
                const request = this._friendRequests.find(r => r.id === requestId);
                if (request) {
                    // 添加双向好友关系
                    await this._addFriendRelation(request.fromOpenid);
                }
            }
            
            // 移除已处理的请求
            this._friendRequests = this._friendRequests.filter(r => r.id !== requestId);
            
            console.log(`[FriendManager] 好友请求已${accept ? '接受' : '拒绝'}`);
            return true;
        } catch (error) {
            console.error('[FriendManager] 处理好友请求失败:', error);
            return false;
        }
    }
    
    /**
     * 添加好友关系
     */
    private async _addFriendRelation(friendOpenid: string): Promise<void> {
        if (!GameMain.instance?.cloudManager) return;
        
        const db = (GameMain.instance.cloudManager as any)._db;
        const myOpenid = GameMain.instance.cloudManager.userOpenId;
        
        // 创建双向好友关系
        await db.collection('friends').add({
            data: {
                userOpenid: myOpenid,
                friendOpenid: friendOpenid,
                createTime: db.serverDate(),
                lastInteraction: db.serverDate()
            }
        });
        
        await db.collection('friends').add({
            data: {
                userOpenid: friendOpenid,
                friendOpenid: myOpenid,
                createTime: db.serverDate(),
                lastInteraction: db.serverDate()
            }
        });
        
        // 刷新好友列表
        await this.refreshFriends();
    }
    
    /**
     * 刷新好友列表
     */
    public async refreshFriends(): Promise<void> {
        if (!GameMain.instance?.cloudManager) return;
        
        try {
            const db = (GameMain.instance.cloudManager as any)._db;
            const myOpenid = GameMain.instance.cloudManager.userOpenId;
            
            // 获取好友关系
            const result = await db.collection('friends')
                .where({
                    userOpenid: myOpenid
                })
                .get();
            
            // 获取好友详细信息
            const friendOpenids = result.data.map((f: any) => f.friendOpenid);
            
            if (friendOpenids.length > 0) {
                const friendDetails = await db.collection('users')
                    .where({
                        _openid: db.command.in(friendOpenids)
                    })
                    .get();
                
                this._friends.clear();
                friendDetails.data.forEach((user: any) => {
                    const friend: Friend = {
                        openid: user._openid,
                        nickname: user.nickname || '未知玩家',
                        avatarUrl: user.avatarUrl || '',
                        level: user.level || 1,
                        lastLoginTime: user.lastLoginTime || Date.now(),
                        isOnline: this._isOnline(user.lastLoginTime),
                        canSendEnergy: true,
                        canReceiveEnergy: false,
                        battlePower: user.battlePower || 0,
                        mainPet: user.mainPet || ''
                    };
                    this._friends.set(friend.openid, friend);
                });
            }
            
            this._saveFriends();
            console.log(`[FriendManager] 好友列表已刷新，共${this._friends.size}位好友`);
        } catch (error) {
            console.error('[FriendManager] 刷新好友列表失败:', error);
        }
    }
    
    /**
     * 删除好友
     */
    public async removeFriend(friendOpenid: string): Promise<boolean> {
        if (!GameMain.instance?.cloudManager) return false;
        
        try {
            const db = (GameMain.instance.cloudManager as any)._db;
            const myOpenid = GameMain.instance.cloudManager.userOpenId;
            
            // 删除双向关系
            const myFriends = await db.collection('friends')
                .where({
                    userOpenid: myOpenid,
                    friendOpenid: friendOpenid
                })
                .get();
            
            const theirFriends = await db.collection('friends')
                .where({
                    userOpenid: friendOpenid,
                    friendOpenid: myOpenid
                })
                .get();
            
            // 批量删除
            const batch = db.batch();
            myFriends.data.forEach((doc: any) => {
                batch.remove(db.collection('friends').doc(doc._id));
            });
            theirFriends.data.forEach((doc: any) => {
                batch.remove(db.collection('friends').doc(doc._id));
            });
            
            await batch.commit();
            
            this._friends.delete(friendOpenid);
            this._saveFriends();
            
            console.log('[FriendManager] 好友已删除');
            return true;
        } catch (error) {
            console.error('[FriendManager] 删除好友失败:', error);
            return false;
        }
    }
    
    /**
     * 赠送体力
     */
    public async sendEnergy(friendOpenid: string): Promise<boolean> {
        const friend = this._friends.get(friendOpenid);
        if (!friend || !friend.canSendEnergy) return false;
        
        // 检查今日赠送次数
        const sentCount = await this._getTodaySentEnergyCount();
        if (sentCount >= this._energySendLimit) {
            console.log('[FriendManager] 今日赠送次数已达上限');
            return false;
        }
        
        try {
            // 记录赠送
            await this._recordEnergySend(friendOpenid);
            
            // 更新好友状态
            friend.canSendEnergy = false;
            this._saveFriends();
            
            console.log(`[FriendManager] 已向${friend.nickname}赠送体力`);
            
            // 触发事件
            EventManager.instance.emit('energy_sent', { friendOpenid });
            
            return true;
        } catch (error) {
            console.error('[FriendManager] 赠送体力失败:', error);
            return false;
        }
    }
    
    /**
     * 领取体力
     */
    public async receiveEnergy(friendOpenid: string): Promise<boolean> {
        const friend = this._friends.get(friendOpenid);
        if (!friend) return false;
        
        // 检查今日领取次数
        const receivedCount = await this._getTodayReceivedEnergyCount();
        if (receivedCount >= this._energyReceiveLimit) {
            console.log('[FriendManager] 今日领取次数已达上限');
            return false;
        }
        
        try {
            // 记录领取
            await this._recordEnergyReceive(friendOpenid);
            
            // 增加体力
            console.log('[FriendManager] 领取体力成功，+5体力');
            
            // 触发事件
            EventManager.instance.emit('energy_received', { 
                friendOpenid,
                amount: 5 
            });
            
            return true;
        } catch (error) {
            console.error('[FriendManager] 领取体力失败:', error);
            return false;
        }
    }
    
    /**
     * 好友助战
     */
    public async getFriendAssistPet(friendOpenid: string): Promise<any> {
        const friend = this._friends.get(friendOpenid);
        if (!friend) return null;
        
        // 获取好友的主力萌宠
        if (!GameMain.instance?.cloudManager) return null;
        
        try {
            const db = (GameMain.instance.cloudManager as any)._db;
            const result = await db.collection('users')
                .doc(friendOpenid)
                .get();
            
            if (result.data && result.data.team && result.data.team.length > 0) {
                const mainPetId = result.data.team[0];
                // 返回萌宠信息
                return {
                    petId: mainPetId,
                    owner: friend.nickname,
                    ownerAvatar: friend.avatarUrl
                };
            }
            
            return null;
        } catch (error) {
            console.error('[FriendManager] 获取助战萌宠失败:', error);
            return null;
        }
    }
    
    /**
     * 获取好友列表
     */
    public getFriends(): Friend[] {
        return Array.from(this._friends.values()).sort((a, b) => {
            // 在线优先，然后按等级排序
            if (a.isOnline !== b.isOnline) {
                return a.isOnline ? -1 : 1;
            }
            return b.level - a.level;
        });
    }
    
    /**
     * 获取好友数量
     */
    public getFriendCount(): number {
        return this._friends.size;
    }
    
    /**
     * 获取在线好友数量
     */
    public getOnlineFriendCount(): number {
        return Array.from(this._friends.values()).filter(f => f.isOnline).length;
    }
    
    /**
     * 是否是在线状态
     */
    private _isOnline(lastLoginTime: number): boolean {
        // 5分钟内登录过算在线
        return Date.now() - lastLoginTime < 5 * 60 * 1000;
    }
    
    /**
     * 获取今日赠送次数
     */
    private async _getTodaySentEnergyCount(): Promise<number> {
        // 从本地或云端获取
        const key = `energy_sent_${this._getTodayKey()}`;
        const count = cc.sys.localStorage.getItem(key);
        return count ? parseInt(count) : 0;
    }
    
    /**
     * 获取今日领取次数
     */
    private async _getTodayReceivedEnergyCount(): Promise<number> {
        const key = `energy_received_${this._getTodayKey()}`;
        const count = cc.sys.localStorage.getItem(key);
        return count ? parseInt(count) : 0;
    }
    
    /**
     * 记录赠送
     */
    private async _recordEnergySend(friendOpenid: string): Promise<void> {
        const key = `energy_sent_${this._getTodayKey()}`;
        const count = await this._getTodaySentEnergyCount();
        cc.sys.localStorage.setItem(key, (count + 1).toString());
    }
    
    /**
     * 记录领取
     */
    private async _recordEnergyReceive(friendOpenid: string): Promise<void> {
        const key = `energy_received_${this._getTodayKey()}`;
        const count = await this._getTodayReceivedEnergyCount();
        cc.sys.localStorage.setItem(key, (count + 1).toString());
    }
    
    /**
     * 获取今日日期key
     */
    private _getTodayKey(): string {
        const date = new Date();
        return `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;
    }
    
    /**
     * 保存好友列表
     */
    private _saveFriends(): void {
        try {
            const data = Array.from(this._friends.values());
            cc.sys.localStorage.setItem('friends', JSON.stringify(data));
        } catch (e) {
            console.error('[FriendManager] 保存好友列表失败', e);
        }
    }
    
    /**
     * 加载好友列表
     */
    private _loadFriends(): void {
        try {
            const data = cc.sys.localStorage.getItem('friends');
            if (data) {
                const friends = JSON.parse(data);
                friends.forEach((f: Friend) => {
                    this._friends.set(f.openid, f);
                });
            }
        } catch (e) {
            console.error('[FriendManager] 加载好友列表失败', e);
        }
    }
}
