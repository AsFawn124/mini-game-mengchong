/**
 * 新手引导管理器
 * 管理游戏的新手引导流程
 */

import GameMain from '../GameMain';

const { ccclass } = cc._decorator;

export interface TutorialStep {
    id: string;
    text: string;
    highlightNode?: string;  // 要高亮的节点名称
    action?: string;         // 需要执行的动作
    autoAdvance?: boolean;   // 是否自动进入下一步
}

@ccclass
export class TutorialManager extends cc.Component {
    
    private _steps: TutorialStep[] = [
        {
            id: 'welcome',
            text: '欢迎来到萌宠大冒险！\n我是你的向导，让我带你快速上手吧！',
            autoAdvance: true
        },
        {
            id: 'intro_gacha',
            text: '首先，我们需要一只强力的萌宠！\n点击抽卡按钮，抽取你的第一只萌宠。',
            highlightNode: 'gachaButton',
            action: 'open_gacha'
        },
        {
            id: 'first_gacha',
            text: '太棒了！你获得了一只萌宠！\n让我们看看它是什么属性的。',
            autoAdvance: true
        },
        {
            id: 'intro_team',
            text: '现在把萌宠上阵吧！\n点击阵容空位，选择刚获得的萌宠。',
            highlightNode: 'teamSlot',
            action: 'open_team'
        },
        {
            id: 'intro_battle',
            text: '准备好了！\n点击战斗按钮，开始你的第一场冒险！',
            highlightNode: 'battleButton',
            action: 'start_battle'
        },
        {
            id: 'intro_skill',
            text: '战斗中每过3波可以选择一个技能！\n根据你的阵容选择合适的技能。',
            highlightNode: 'skillPanel',
            autoAdvance: true
        },
        {
            id: 'intro_merge',
            text: '获得3只相同的萌宠可以合成更高级的！\n去背包试试吧！',
            highlightNode: 'bagButton',
            action: 'open_bag'
        },
        {
            id: 'complete',
            text: '恭喜完成新手引导！\n祝你游戏愉快，收集更多萌宠！',
            autoAdvance: true
        }
    ];
    
    private _currentStep: number = 0;
    private _isActive: boolean = false;
    private _tutorialPanel: cc.Node = null;
    private _maskNode: cc.Node = null;
    
    onLoad() {
        this._createTutorialUI();
    }
    
    /**
     * 检查是否需要显示新手引导
     */
    public checkAndStart(): void {
        const hasCompleted = this._getTutorialStatus();
        if (!hasCompleted) {
            this.startTutorial();
        }
    }
    
    /**
     * 开始新手引导
     */
    public startTutorial(): void {
        this._isActive = true;
        this._currentStep = 0;
        this._showStep();
        
        console.log('[TutorialManager] 新手引导开始');
    }
    
    /**
     * 显示当前步骤
     */
    private _showStep(): void {
        if (this._currentStep >= this._steps.length) {
            this._completeTutorial();
            return;
        }
        
        const step = this._steps[this._currentStep];
        
        // 显示引导面板
        this._tutorialPanel.active = true;
        
        // 更新文本
        const textLabel = this._tutorialPanel.getChildByName('Text')?.getComponent(cc.Label);
        if (textLabel) {
            textLabel.string = step.text;
        }
        
        // 高亮节点
        if (step.highlightNode) {
            this._highlightNode(step.highlightNode);
        } else {
            this._maskNode.active = false;
        }
        
        // 自动进入下一步
        if (step.autoAdvance) {
            this.scheduleOnce(() => {
                this.nextStep();
            }, 3);
        }
        
        // 执行动作
        if (step.action) {
            this._executeAction(step.action);
        }
    }
    
    /**
     * 高亮节点
     */
    private _highlightNode(nodeName: string): void {
        // 查找目标节点
        const targetNode = cc.find(nodeName);
        if (!targetNode) {
            console.warn(`[TutorialManager] 未找到节点: ${nodeName}`);
            return;
        }
        
        // 显示遮罩
        this._maskNode.active = true;
        
        // 计算目标节点位置
        const worldPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = this._maskNode.parent.convertToNodeSpaceAR(worldPos);
        
        // 创建镂空效果（简化版：在目标位置显示一个透明圆圈）
        const holeNode = new cc.Node('Hole');
        holeNode.setPosition(localPos);
        holeNode.setContentSize(200, 200);
        
        // 添加动画
        cc.tween(holeNode)
            .to(0.5, { scale: 1.1 })
            .to(0.5, { scale: 1.0 })
            .union()
            .repeatForever()
            .start();
        
        this._maskNode.addChild(holeNode);
        
        // 监听点击
        targetNode.once(cc.Node.EventType.TOUCH_END, () => {
            this.nextStep();
        });
    }
    
    /**
     * 执行引导动作
     */
    private _executeAction(action: string): void {
        switch (action) {
            case 'open_gacha':
                // 自动打开抽卡界面（可选）
                break;
            case 'open_team':
                // 自动打开阵容界面
                break;
            case 'start_battle':
                // 等待用户点击
                break;
            case 'open_bag':
                // 自动打开背包
                break;
        }
    }
    
    /**
     * 下一步
     */
    public nextStep(): void {
        // 清理当前步骤
        this._maskNode.removeAllChildren();
        
        this._currentStep++;
        this._showStep();
    }
    
    /**
     * 跳过引导
     */
    public skipTutorial(): void {
        this._completeTutorial();
    }
    
    /**
     * 完成引导
     */
    private _completeTutorial(): void {
        this._isActive = false;
        this._tutorialPanel.active = false;
        this._maskNode.active = false;
        
        // 保存完成状态
        this._setTutorialStatus(true);
        
        // 发放奖励
        this._giveTutorialReward();
        
        console.log('[TutorialManager] 新手引导完成');
    }
    
    /**
     * 发放引导奖励
     */
    private _giveTutorialReward(): void {
        // 奖励：钻石 x 100
        console.log('[TutorialManager] 发放引导奖励：钻石 x 100');
        
        // 触发奖励事件
        cc.game.emit('tutorial_complete', { diamond: 100 });
    }
    
    /**
     * 创建引导UI
     */
    private _createTutorialUI(): void {
        // 创建引导面板
        this._tutorialPanel = new cc.Node('TutorialPanel');
        this._tutorialPanel.setContentSize(600, 300);
        this._tutorialPanel.setPosition(0, -300);
        this.node.addChild(this._tutorialPanel);
        
        // 背景
        const bg = new cc.Node('BG');
        bg.setContentSize(600, 300);
        const bgSprite = bg.addComponent(cc.Sprite);
        // TODO: 设置背景图
        bg.color = new cc.Color(0, 0, 0, 200);
        this._tutorialPanel.addChild(bg);
        
        // 文本
        const textNode = new cc.Node('Text');
        textNode.setContentSize(550, 200);
        const textLabel = textNode.addComponent(cc.Label);
        textLabel.string = '';
        textLabel.fontSize = 28;
        textLabel.color = cc.Color.WHITE;
        textLabel.overflow = cc.Label.Overflow.WRAP;
        textLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        textLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        this._tutorialPanel.addChild(textNode);
        
        // 下一步按钮
        const nextBtn = new cc.Node('NextBtn');
        nextBtn.setContentSize(150, 60);
        nextBtn.setPosition(200, -100);
        const btnLabel = nextBtn.addComponent(cc.Label);
        btnLabel.string = '下一步';
        btnLabel.fontSize = 24;
        nextBtn.on(cc.Node.EventType.TOUCH_END, this.nextStep, this);
        this._tutorialPanel.addChild(nextBtn);
        
        // 跳过按钮
        const skipBtn = new cc.Node('SkipBtn');
        skipBtn.setContentSize(100, 40);
        skipBtn.setPosition(250, 120);
        const skipLabel = skipBtn.addComponent(cc.Label);
        skipLabel.string = '跳过';
        skipLabel.fontSize = 20;
        skipLabel.color = cc.Color.GRAY;
        skipBtn.on(cc.Node.EventType.TOUCH_END, this.skipTutorial, this);
        this._tutorialPanel.addChild(skipBtn);
        
        // 创建遮罩
        this._maskNode = new cc.Node('Mask');
        this._maskNode.setContentSize(cc.winSize);
        this._maskNode.setPosition(0, 0);
        const maskSprite = this._maskNode.addComponent(cc.Sprite);
        maskSprite.node.color = new cc.Color(0, 0, 0, 150);
        this.node.addChild(this._maskNode);
        
        // 初始隐藏
        this._tutorialPanel.active = false;
        this._maskNode.active = false;
    }
    
    /**
     * 获取引导完成状态
     */
    private _getTutorialStatus(): boolean {
        try {
            return cc.sys.localStorage.getItem('tutorial_completed') === 'true';
        } catch (e) {
            return false;
        }
    }
    
    /**
     * 设置引导完成状态
     */
    private _setTutorialStatus(completed: boolean): void {
        try {
            cc.sys.localStorage.setItem('tutorial_completed', completed.toString());
        } catch (e) {
            console.error('[TutorialManager] 保存引导状态失败', e);
        }
    }
    
    /**
     * 重置引导（用于测试）
     */
    public resetTutorial(): void {
        this._setTutorialStatus(false);
        console.log('[TutorialManager] 引导已重置');
    }
    
    /**
     * 获取是否正在引导中
     */
    public get isActive(): boolean {
        return this._isActive;
    }
}
