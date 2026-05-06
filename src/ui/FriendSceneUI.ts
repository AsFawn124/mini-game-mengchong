/**
 * 好友场景UI
 * 好友界面，包含好友列表、添加好友、好友互动等功能
 */

import GameMain from '../GameMain';
import { Friend, FriendManager } from '../managers/FriendManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class FriendSceneUI extends cc.Component {
    
    // UI组件引用
    @property(cc.Node)
    friendListContent: cc.Node = null;
    
    @property(cc.Node)
    searchPanel: cc.Node = null;
    
    @property(cc.Node)
    requestPanel: cc.Node = null;
    
    @property(cc.EditBox)
    searchInput: cc.EditBox = null;
    
    @property(cc.Label)
    friendCountLabel: cc.Label = null;
    
    @property(cc.Node)
    backButton: cc.Node = null;
    
    @property(cc.Node)
    addButton: cc.Node = null;
    
    @property(cc.Node)
    requestButton: cc.Node = null;
    
    // 当前选中的好友
    private _selectedFriend: Friend = null;
    private _friendManager: FriendManager = null;
    
    onLoad() {
        console.log('[FriendSceneUI] 好友场景加载');
        this._initUI();
        this._friendManager = GameMain.instance?.node.getComponent(FriendManager);
    }
    
    start() {
        this._refreshFriendList();
        this._updateFriendCount();
    }
    
    /**
     * 初始化UI
     */
    private _initUI(): void {
        // 绑定按钮事件
        this.backButton.on(cc.Node.EventType.TOUCH_END, this._onBack, this);
        this.addButton.on(cc.Node.EventType.TOUCH_END, this._onAddFriend, this);
        this.requestButton.on(cc.Node.EventType.TOUCH_END, this._onShowRequests, this);
        
        // 隐藏面板
        this.searchPanel.active = false;
        this.requestPanel.active = false;
    }
    
    /**
     * 刷新好友列表
     */
    private async _refreshFriendList(): Promise<void> {
        if (!this._friendManager) return;
        
        // 刷新好友数据
        await this._friendManager.refreshFriends();
        
        const friends = this._friendManager.getFriends();
        
        // 清空列表
        this.friendListContent.removeAllChildren();
        
        // 创建好友列表项
        friends.forEach((friend, index) => {
            const item = this._createFriendItem(friend, index);
            this.friendListContent.addChild(item);
        });
        
        // 更新数量显示
        this._updateFriendCount();
    }
    
    /**
     * 创建好友列表项
     */
    private _createFriendItem(friend: Friend, index: number): cc.Node {
        const item = new cc.Node('FriendItem');
        item.setContentSize(700, 120);
        
        // 背景
        const bg = item.addComponent(cc.Sprite);
        // TODO: 设置背景
        
        // 头像
        const avatarNode = new cc.Node('Avatar');
        avatarNode.setContentSize(80, 80);
        avatarNode.setPosition(-280, 0);
        const avatarSprite = avatarNode.addComponent(cc.Sprite);
        // TODO: 加载头像
        item.addChild(avatarNode);
        
        // 在线状态指示器
        const onlineIndicator = new cc.Node('Online');
        onlineIndicator.setContentSize(16, 16);
        onlineIndicator.setPosition(-250, -30);
        const indicatorSprite = onlineIndicator.addComponent(cc.Sprite);
        indicatorSprite.node.color = friend.isOnline ? cc.Color.GREEN : cc.Color.GRAY;
        item.addChild(onlineIndicator);
        
        // 昵称
        const nameNode = new cc.Node('Name');
        const nameLabel = nameNode.addComponent(cc.Label);
        nameLabel.string = friend.nickname;
        nameLabel.fontSize = 26;
        nameNode.setPosition(-180, 30);
        item.addChild(nameNode);
        
        // 等级
        const levelNode = new cc.Node('Level');
        const levelLabel = levelNode.addComponent(cc.Label);
        levelLabel.string = `Lv.${friend.level}`;
        levelLabel.fontSize = 20;
        levelLabel.color = cc.Color.YELLOW;
        levelNode.setPosition(-180, -10);
        item.addChild(levelNode);
        
        // 战力
        const powerNode = new cc.Node('Power');
        const powerLabel = powerNode.addComponent(cc.Label);
        powerLabel.string = `战力: ${friend.battlePower}`;
        powerLabel.fontSize = 18;
        powerLabel.color = cc.Color.ORANGE;
        powerNode.setPosition(-180, -40);
        item.addChild(powerNode);
        
        // 赠送体力按钮
        if (friend.canSendEnergy) {
            const sendBtn = new cc.Node('SendBtn');
            sendBtn.setContentSize(100, 50);
            sendBtn.setPosition(150, 0);
            const sendLabel = sendBtn.addComponent(cc.Label);
            sendLabel.string = '送体力';
            sendLabel.fontSize = 20;
            sendBtn.on(cc.Node.EventType.TOUCH_END, () => {
                this._onSendEnergy(friend);
            });
            item.addChild(sendBtn);
        }
        
        // 助战按钮
        const assistBtn = new cc.Node('AssistBtn');
        assistBtn.setContentSize(100, 50);
        assistBtn.setPosition(280, 0);
        const assistLabel = assistBtn.addComponent(cc.Label);
        assistLabel.string = '助战';
        assistLabel.fontSize = 20;
        assistBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this._onRequestAssist(friend);
        });
        item.addChild(assistBtn);
        
        // 点击事件
        item.on(cc.Node.EventType.TOUCH_END, () => {
            this._onFriendClick(friend);
        });
        
        return item;
    }
    
    /**
     * 点击好友
     */
    private _onFriendClick(friend: Friend): void {
        console.log('[FriendSceneUI] 点击好友:', friend.nickname);
        this._selectedFriend = friend;
        this._showFriendDetail(friend);
    }
    
    /**
     * 显示好友详情
     */
    private _showFriendDetail(friend: Friend): void {
        // TODO: 实现好友详情弹窗
        console.log('[FriendSceneUI] 显示好友详情:', friend);
    }
    
    /**
     * 赠送体力
     */
    private async _onSendEnergy(friend: Friend): Promise<void> {
        if (!this._friendManager) return;
        
        const success = await this._friendManager.sendEnergy(friend.openid);
        if (success) {
            this._showToast(`已向${friend.nickname}赠送体力`);
            this._refreshFriendList();
        } else {
            this._showToast('赠送失败，今日次数已达上限');
        }
    }
    
    /**
     * 请求助战
     */
    private async _onRequestAssist(friend: Friend): Promise<void> {
        if (!this._friendManager) return;
        
        const assistPet = await this._friendManager.getFriendAssistPet(friend.openid);
        if (assistPet) {
            this._showToast(`获得${friend.nickname}的助战！`);
            // TODO: 将助战萌宠加入战斗
        } else {
            this._showToast('该好友未设置助战萌宠');
        }
    }
    
    /**
     * 添加好友
     */
    private _onAddFriend(): void {
        this.searchPanel.active = true;
        
        // 清空搜索输入
        if (this.searchInput) {
            this.searchInput.string = '';
        }
        
        // 显示搜索面板
        const searchBtn = this.searchPanel.getChildByName('SearchBtn');
        if (searchBtn) {
            searchBtn.off(cc.Node.EventType.TOUCH_END);
            searchBtn.on(cc.Node.EventType.TOUCH_END, () => {
                this._onSearch();
            });
        }
    }
    
    /**
     * 搜索好友
     */
    private async _onSearch(): Promise<void> {
        if (!this._friendManager || !this.searchInput) return;
        
        const keyword = this.searchInput.string.trim();
        if (!keyword) {
            this._showToast('请输入搜索关键词');
            return;
        }
        
        const results = await this._friendManager.searchFriend(keyword);
        
        // 显示搜索结果
        const resultContent = this.searchPanel.getChildByName('ResultContent');
        if (resultContent) {
            resultContent.removeAllChildren();
            
            results.forEach((friend, index) => {
                const item = this._createSearchResultItem(friend, index);
                resultContent.addChild(item);
            });
        }
    }
    
    /**
     * 创建搜索结果项
     */
    private _createSearchResultItem(friend: Friend, index: number): cc.Node {
        const item = new cc.Node('SearchResult');
        item.setContentSize(600, 100);
        
        // 昵称
        const nameNode = new cc.Node('Name');
        const nameLabel = nameNode.addComponent(cc.Label);
        nameLabel.string = friend.nickname;
        nameLabel.fontSize = 24;
        nameNode.setPosition(-200, 0);
        item.addChild(nameNode);
        
        // 等级
        const levelNode = new cc.Node('Level');
        const levelLabel = levelNode.addComponent(cc.Label);
        levelLabel.string = `Lv.${friend.level}`;
        levelLabel.fontSize = 20;
        levelNode.setPosition(-50, 0);
        item.addChild(levelNode);
        
        // 添加按钮
        const addBtn = new cc.Node('AddBtn');
        addBtn.setContentSize(100, 50);
        addBtn.setPosition(200, 0);
        const addLabel = addBtn.addComponent(cc.Label);
        addLabel.string = '添加';
        addLabel.fontSize = 20;
        addBtn.on(cc.Node.EventType.TOUCH_END, async () => {
            const success = await this._friendManager.sendFriendRequest(friend.openid);
            if (success) {
                this._showToast('好友请求已发送');
                addLabel.string = '已发送';
                addBtn.getComponent(cc.Button).interactable = false;
            } else {
                this._showToast('发送失败');
            }
        });
        item.addChild(addBtn);
        
        return item;
    }
    
    /**
     * 显示好友请求
     */
    private async _onShowRequests(): Promise<void> {
        if (!this._friendManager) return;
        
        this.requestPanel.active = true;
        
        const requests = await this._friendManager.getFriendRequests();
        
        const content = this.requestPanel.getChildByName('Content');
        if (content) {
            content.removeAllChildren();
            
            requests.forEach((request, index) => {
                const item = this._createRequestItem(request, index);
                content.addChild(item);
            });
        }
    }
    
    /**
     * 创建好友请求项
     */
    private _createRequestItem(request: any, index: number): cc.Node {
        const item = new cc.Node('RequestItem');
        item.setContentSize(600, 100);
        
        // 头像
        const avatarNode = new cc.Node('Avatar');
        avatarNode.setContentSize(60, 60);
        avatarNode.setPosition(-250, 0);
        item.addChild(avatarNode);
        
        // 昵称
        const nameNode = new cc.Node('Name');
        const nameLabel = nameNode.addComponent(cc.Label);
        nameLabel.string = request.fromNickname;
        nameLabel.fontSize = 24;
        nameNode.setPosition(-150, 0);
        item.addChild(nameNode);
        
        // 接受按钮
        const acceptBtn = new cc.Node('AcceptBtn');
        acceptBtn.setContentSize(80, 40);
        acceptBtn.setPosition(150, 0);
        const acceptLabel = acceptBtn.addComponent(cc.Label);
        acceptLabel.string = '接受';
        acceptLabel.fontSize = 18;
        acceptLabel.color = cc.Color.GREEN;
        acceptBtn.on(cc.Node.EventType.TOUCH_END, async () => {
            const success = await this._friendManager.handleFriendRequest(request.id, true);
            if (success) {
                this._showToast('已添加好友');
                item.destroy();
                this._refreshFriendList();
            }
        });
        item.addChild(acceptBtn);
        
        // 拒绝按钮
        const rejectBtn = new cc.Node('RejectBtn');
        rejectBtn.setContentSize(80, 40);
        rejectBtn.setPosition(250, 0);
        const rejectLabel = rejectBtn.addComponent(cc.Label);
        rejectLabel.string = '拒绝';
        rejectLabel.fontSize = 18;
        rejectLabel.color = cc.Color.RED;
        rejectBtn.on(cc.Node.EventType.TOUCH_END, async () => {
            const success = await this._friendManager.handleFriendRequest(request.id, false);
            if (success) {
                item.destroy();
            }
        });
        item.addChild(rejectBtn);
        
        return item;
    }
    
    /**
     * 更新好友数量显示
     */
    private _updateFriendCount(): void {
        if (!this._friendManager) return;
        
        const count = this._friendManager.getFriendCount();
        const onlineCount = this._friendManager.getOnlineFriendCount();
        
        if (this.friendCountLabel) {
            this.friendCountLabel.string = `好友: ${count}/50 (在线: ${onlineCount})`;
        }
    }
    
    /**
     * 返回主场景
     */
    private _onBack(): void {
        GameMain.instance?.audioManager.playButtonClick();
        GameMain.instance?.enterScene('MainScene');
    }
    
    /**
     * 显示Toast提示
     */
    private _showToast(message: string): void {
        const toastNode = new cc.Node('Toast');
        toastNode.setPosition(0, 0);
        
        const label = toastNode.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 28;
        label.color = cc.Color.WHITE;
        
        this.node.addChild(toastNode);
        
        toastNode.opacity = 0;
        cc.tween(toastNode)
            .to(0.3, { opacity: 255 })
            .delay(1.5)
            .to(0.3, { opacity: 0 })
            .call(() => toastNode.destroy())
            .start();
    }
}
