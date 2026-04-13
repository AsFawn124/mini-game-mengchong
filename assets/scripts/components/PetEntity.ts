import { _decorator, Component, Node, Vec3, tween, UIOpacity } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 萌宠实体组件
 * 负责萌宠的显示、动画、交互
 */
@ccclass('PetEntity')
export class PetEntity extends Component {
    
    // 萌宠数据
    private petId: string = '';
    private petName: string = '';
    private level: number = 1;
    private rarity: string = 'N';
    
    // 动画状态
    private isAnimating: boolean = false;
    
    onLoad() {
        this.initTouchEvents();
    }
    
    /**
     * 初始化萌宠数据
     */
    init(petData: any): void {
        this.petId = petData.id;
        this.petName = petData.name;
        this.level = petData.level || 1;
        this.rarity = petData.rarity;
        
        this.updateAppearance();
    }
    
    /**
     * 更新外观
     */
    private updateAppearance(): void {
        // 根据稀有度设置颜色
        const rarityColors: { [key: string]: string } = {
            'N': '#9E9E9E',
            'R': '#4CAF50',
            'SR': '#2196F3',
            'SSR': '#FF9800'
        };
        
        // TODO: 更新萌宠图片和边框颜色
        console.log(`更新萌宠外观: ${this.petName}, 稀有度: ${this.rarity}`);
    }
    
    /**
     * 初始化触摸事件
     */
    private initTouchEvents(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    
    /**
     * 触摸开始
     */
    private onTouchStart(event: any): void {
        // 放大效果
        tween(this.node)
            .to(0.1, { scale: new Vec3(1.1, 1.1, 1) })
            .start();
    }
    
    /**
     * 触摸移动
     */
    private onTouchMove(event: any): void {
        // 跟随手指移动
        const delta = event.getDelta();
        const pos = this.node.position;
        this.node.setPosition(pos.x + delta.x, pos.y + delta.y, pos.z);
    }
    
    /**
     * 触摸结束
     */
    private onTouchEnd(event: any): void {
        // 恢复大小
        tween(this.node)
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
        
        // 发送合成事件
        this.node.emit('pet-drop', this);
    }
    
    /**
     * 播放合成动画
     */
    playMergeAnimation(): void {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // 闪光+放大+消失动画
        tween(this.node)
            .to(0.2, { scale: new Vec3(1.3, 1.3, 1) })
            .to(0.1, { scale: new Vec3(0, 0, 1) })
            .call(() => {
                this.isAnimating = false;
                this.node.destroy();
            })
            .start();
    }
    
    /**
     * 播放生成动画
     */
    playSpawnAnimation(): void {
        this.node.setScale(0, 0, 1);
        
        tween(this.node)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    }
    
    /**
     * 播放待机动画
     */
    playIdleAnimation(): void {
        // 呼吸效果
        tween(this.node)
            .to(1, { scale: new Vec3(1.05, 1.05, 1) })
            .to(1, { scale: new Vec3(1, 1, 1) })
            .union()
            .repeatForever()
            .start();
    }
    
    /**
     * 获取萌宠ID
     */
    getPetId(): string {
        return this.petId;
    }
    
    /**
     * 获取萌宠等级
     */
    getLevel(): number {
        return this.level;
    }
    
    /**
     * 获取稀有度
     */
    getRarity(): string {
        return this.rarity;
    }
}