import { _decorator, Component, Node, Label, Button, ScrollView, instantiate, Prefab } from 'cc';
import { RankManager, RankData } from '../managers/RankManager';

const { ccclass, property } = _decorator;

/**
 * 排行榜场景UI
 */
@ccclass('RankSceneUI')
export class RankSceneUI extends Component {
    
    @property(ScrollView)
    rankScrollView: ScrollView = null;
    
    @property(Node)
    rankItemPrefab: Node = null;
    
    @property(Button)
    backBtn: Button = null;
    
    @property(Button)
    dailyTab: Button = null;
    
    @property(Button)
    weeklyTab: Button = null;
    
    @property(Button)
    allTimeTab: Button = null;
    
    @property(Button)
    friendsTab: Button = null;
    
    @property(Label)
    myRankLabel: Label = null;
    
    @property(Label)
    myScoreLabel: Label = null;
    
    private currentTab: 'daily' | 'weekly' | 'allTime' | 'friends' = 'daily';
    
    onLoad() {
        this.bindEvents();
        this.loadRankList('daily');
        this.updateMyRank();
    }
    
    private bindEvents(): void {
        if (this.backBtn) {
            this.backBtn.node.on(Button.EventType.CLICK, this.onBack, this);
        }
        if (this.dailyTab) {
            this.dailyTab.node.on(Button.EventType.CLICK, () => this.onTabClick('daily'), this);
        }
        if (this.weeklyTab) {
            this.weeklyTab.node.on(Button.EventType.CLICK, () => this.onTabClick('weekly'), this);
        }
        if (this.allTimeTab) {
            this.allTimeTab.node.on(Button.EventType.CLICK, () => this.onTabClick('allTime'), this);
        }
        if (this.friendsTab) {
            this.friendsTab.node.on(Button.EventType.CLICK, () => this.onTabClick('friends'), this);
        }
    }
    
    private async loadRankList(type: 'daily' | 'weekly' | 'allTime' | 'friends'): Promise<void> {
        this.currentTab = type;
        
        const rankList = await RankManager.instance.getRankList(type);
        this.updateRankList(rankList);
    }
    
    private updateRankList(rankList: RankData[]): void {
        if (!this.rankScrollView || !this.rankItemPrefab) return;
        
        const content = this.rankScrollView.content;
        content.removeAllChildren();
        
        rankList.forEach((data, index) => {
            const item = instantiate(this.rankItemPrefab);
            this.updateRankItem(item, data);
            content.addChild(item);
        });
    }
    
    private updateRankItem(item: Node, data: RankData): void {
        // 更新排行榜项显示
        const rankLabel = item.getChildByName('RankLabel')?.getComponent(Label);
        const nameLabel = item.getChildByName('NameLabel')?.getComponent(Label);
        const scoreLabel = item.getChildByName('ScoreLabel')?.getComponent(Label);
        const waveLabel = item.getChildByName('WaveLabel')?.getComponent(Label);
        
        if (rankLabel) rankLabel.string = `${data.rank}`;
        if (nameLabel) nameLabel.string = data.nickname;
        if (scoreLabel) scoreLabel.string = `${data.score}`;
        if (waveLabel) waveLabel.string = `${data.wave}波`;
    }
    
    private updateMyRank(): void {
        const bestScore = RankManager.instance.getBestScore();
        const bestWave = RankManager.instance.getBestWave();
        
        if (this.myRankLabel) {
            this.myRankLabel.string = '未上榜';
        }
        if (this.myScoreLabel) {
            this.myScoreLabel.string = `最高分: ${bestScore} | 最高波数: ${bestWave}`;
        }
    }
    
    private onTabClick(type: 'daily' | 'weekly' | 'allTime' | 'friends'): void {
        this.loadRankList(type);
    }
    
    private onBack(): void {
        const { director } = require('cc');
        director.loadScene('MainScene');
    }
}