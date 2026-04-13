import { _decorator, Component, Node, Vec3, tween, ParticleSystem2D } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 特效管理器
 * 统一管理游戏中的各种特效
 */
@ccclass('EffectManager')
export class EffectManager extends Component {
    
    // 单例
    private static _instance: EffectManager = null;
    public static get instance(): EffectManager {
        return EffectManager._instance;
    }
    
    @property(ParticleSystem2D)
    mergeEffect: ParticleSystem2D = null;      // 合成特效
    
    @property(ParticleSystem2D)
    goldEffect: ParticleSystem2D = null;       // 金币特效
    
    @property(ParticleSystem2D)
    levelUpEffect: ParticleSystem2D = null;    // 升级特效
    
    onLoad() {
        if (EffectManager._instance === null) {
            EffectManager._instance = this;
        }
    }
    
    /**
     * 播放合成特效
     */
    playMergeEffect(position: Vec3): void {
        if (this.mergeEffect) {
            this.mergeEffect.node.setPosition(position);
            this.mergeEffect.resetSystem();
            this.mergeEffect.play();
        }
    }
    
    /**
     * 播放金币特效
     */
    playGoldEffect(position: Vec3, amount: number): void {
        if (this.goldEffect) {
            this.goldEffect.node.setPosition(position);
            this.goldEffect.resetSystem();
            this.goldEffect.play();
        }
        
        // 显示金币飘字
        this.showFloatingText(position, `+${amount}💰`, '#FFD700');
    }
    
    /**
     * 播放升级特效
     */
    playLevelUpEffect(position: Vec3): void {
        if (this.levelUpEffect) {
            this.levelUpEffect.node.setPosition(position);
            this.levelUpEffect.resetSystem();
            this.levelUpEffect.play();
        }
        
        this.showFloatingText(position, 'LEVEL UP!', '#00FF00');
    }
    
    /**
     * 播放获得萌宠特效
     */
    playGetPetEffect(position: Vec3, petName: string): void {
        // 彩虹粒子效果
        this.showFloatingText(position, `获得 ${petName}!`, '#FF69B4');
    }
    
    /**
     * 显示飘字
     */
    private showFloatingText(position: Vec3, text: string, color: string): void {
        // TODO: 创建飘字节点并播放动画
        console.log(`飘字: ${text}`);
    }
    
    /**
     * 屏幕震动
     */
    screenShake(duration: number = 0.3, intensity: number = 10): void {
        const camera = this.node.scene.getComponentInChildren('Camera');
        if (!camera) return;
        
        const originalPos = camera.node.position.clone();
        
        tween(camera.node)
            .by(0.05, { position: new Vec3(intensity, 0, 0) })
            .by(0.05, { position: new Vec3(-intensity * 2, 0, 0) })
            .by(0.05, { position: new Vec3(intensity * 2, 0, 0) })
            .by(0.05, { position: new Vec3(-intensity, 0, 0) })
            .set({ position: originalPos })
            .start();
    }
    
    /**
     * 播放按钮点击特效
     */
    playButtonClickEffect(buttonNode: Node): void {
        tween(buttonNode)
            .to(0.05, { scale: new Vec3(0.95, 0.95, 1) })
            .to(0.05, { scale: new Vec3(1.05, 1.05, 1) })
            .to(0.05, { scale: new Vec3(1, 1, 1) })
            .start();
    }
    
    /**
     * 播放获得奖励特效
     */
    playRewardEffect(items: { type: string, amount: number }[]): void {
        // 依次播放各种奖励的特效
        items.forEach((item, index) => {
            setTimeout(() => {
                const position = new Vec3(0, 200 - index * 50, 0);
                
                switch (item.type) {
                    case 'gold':
                        this.playGoldEffect(position, item.amount);
                        break;
                    case 'diamond':
                        this.showFloatingText(position, `+${item.amount}💎`, '#00BFFF');
                        break;
                    case 'pet':
                        this.playGetPetEffect(position, '新萌宠');
                        break;
                }
            }, index * 200);
        });
    }
}