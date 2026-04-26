import { _decorator, Component, Node, Label, Button, ScrollView, ProgressBar, instantiate } from 'cc';
import { BattlePassManager, BattlePassReward } from '../managers/BattlePassManager';

const { ccclass, property } = _decorator;

/**
 * 战令场景UI
 */
@ccclass('BattlePassSceneUI')
export class BattlePassSceneUI extends Component {
    
    @property(Label)
    levelLabel: Label = null;
    
    @property(Label)
    expLabel: Label = null;
    
    @property(ProgressBar)
    expProgress: ProgressBar = null;
    
    @property(ScrollView)
    rewardScrollView: ScrollView = null;
    
    @property(Node)
    rewardItemPrefab: Node = null;
    
    @property(Button)
    backBtn: Button = null;
    
    @property(Button)
    buyPremiumBtn: Button = null;
    
    @property(Button)
    claimAllBtn: Button = null;
    
    @property(Node)
    premiumTag: Node = null;
    
    onLoad() {
        this.bindEvents();
        this.updateUI();
        this.loadRewards();
    }
    
    private bindEvents(): void {
        if (this.backBtn) {
            this.backBtn.node.on(Button.EventType.CLICK, this.onBack, this);
        }
        if (this.buyPremiumBtn) {
            this.buyPremiumBtn.node.on(Button.EventType.CLICK, this.onBuyPremium, this);
        }
        if (this.claimAllBtn) {
            this.claimAllBtn.node.on(Button.EventType.CLICK, this.onClaimAll, this);
        }
    }
    
    private updateUI(): void {
        const level = BattlePassManager.instance.getLevel();
        const exp = BattlePassManager.instance.getExp();
        const progress = BattlePassManager.instance.getProgress();
        const isPremium = BattlePassManager.instance.isPremiumUser();
        
        if (this.levelLabel) {
            this.levelLabel.string = `Lv.${level}`;
        }
        if (this.expLabel) {
            this.expLabel.string = `${exp}/1000`;
        }
        if (this.expProgress) {
            this.expProgress.progress = progress;
        }
        if (this.premiumTag) {
            this.premiumTag.active = isPremium;
        }
        if (this.buyPremiumBtn) {
            this.buyPremiumBtn.node.active = !isPremium;
        }
    }
    
    private loadRewards(): void {
        if (!this.rewardScrollView || !this.rewardItemPrefab) return;
        
        const rewards = BattlePassManager.instance.getAllRewards();
        const content = this.rewardScrollView.content;
        content.removeAllChildren();
        
        rewards.forEach(reward => {
            const node = instantiate(this.rewardItemPrefab);
            this.updateRewardItem(node, reward);
            content.addChild(node);
        });
    }
    
    private updateRewardItem(node: Node, reward: BattlePassReward): void {
        const levelLabel = node.getChildByName('LevelLabel')?.getComponent(Label);
        const freeRewardLabel = node.getChildByName('FreeRewardLabel')?.getComponent(Label);
        const premiumRewardLabel = node.getChildByName('PremiumRewardLabel')?.getComponent(Label);
        const claimBtn = node.getChildByName('ClaimButton')?.getComponent(Button);
        const claimedTag = node.getChildByName('ClaimedTag');
        
        if (levelLabel) levelLabel.string = `Lv.${reward.level}`;
        if (freeRewardLabel) {
            freeRewardLabel.string = `${reward.freeReward.type} x${reward.freeReward.amount}`;
        }
        if (premiumRewardLabel) {
            premiumRewardLabel.string = `${reward.premiumReward.type} x${reward.premiumReward.amount}`;
        }
        
        const canClaim = BattlePassManager.instance.getLevel() >= reward.level;
        const isClaimed = BattlePassManager.instance.getClaimableRewards().indexOf(reward.level) === -1;
        
        if (claimBtn) {
            claimBtn.node.active = canClaim && !isClaimed;
            claimBtn.node.on(Button.EventType.CLICK, () => this.onClaim(reward.level), this);
        }
        if (claimedTag) {
            claimedTag.active = isClaimed;
        }
    }
    
    private onClaim(level: number): void {
        const success = BattlePassManager.instance.claimReward(level);
        if (success) {
            this.showMessage('领取成功！');
            this.loadRewards();
        }
    }
    
    private async onBuyPremium(): Promise<void> {
        // TODO: 接入支付
        const success = await BattlePassManager.instance.buyPremium();
        if (success) {
            this.showMessage('购买高级战令成功！');
            this.updateUI();
            this.loadRewards();
        }
    }
    
    private onClaimAll(): void {
        const claimable = BattlePassManager.instance.getClaimableRewards();
        claimable.forEach(level => {
            BattlePassManager.instance.claimReward(level);
        });
        this.showMessage('一键领取成功！');
        this.loadRewards();
    }
    
    private onBack(): void {
        const { director } = require('cc');
        director.loadScene('MainScene');
    }
    
    private showMessage(msg: string): void {
        console.log(msg);
        // TODO: 显示Toast
    }
}