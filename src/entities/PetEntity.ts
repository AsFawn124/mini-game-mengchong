/**
 * 萌宠实体类
 * 负责萌宠的显示、动画、交互
 */

import { Pet } from '../managers/PetManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PetEntity extends cc.Component {
    
    // 萌宠数据
    private _petData: Pet = null;
    
    // 动画组件
    private _animator: cc.Animation = null;
    
    // 血条
    @property(cc.Node)
    hpBarNode: cc.Node = null;
    
    @property(cc.Label)
    hpLabel: cc.Label = null;
    
    // 选中效果
    @property(cc.Node)
    selectEffect: cc.Node = null;
    
    // 属性图标
    @property(cc.Sprite)
    elementIcon: cc.Sprite = null;
    
    // 稀有度边框
    @property(cc.Sprite)
    rarityBorder: cc.Sprite = null;
    
    onLoad() {
        this._animator = this.getComponent(cc.Animation);
        if (this.selectEffect) {
            this.selectEffect.active = false;
        }
    }
    
    /**
     * 设置萌宠数据
     */
    public setPetData(petData: Pet): void {
        this._petData = petData;
        this._updateDisplay();
    }
    
    /**
     * 获取萌宠数据
     */
    public getPetData(): Pet {
        return this._petData;
    }
    
    /**
     * 更新显示
     */
    private _updateDisplay(): void {
        if (!this._petData) return;
        
        // 更新血条
        this._updateHPBar();
        
        // 更新属性图标
        this._updateElementIcon();
        
        // 更新稀有度边框
        this._updateRarityBorder();
    }
    
    /**
     * 更新血条显示
     */
    private _updateHPBar(): void {
        if (!this.hpBarNode || !this._petData) return;
        
        const maxHp = this._petData.hp;
        const currentHp = this._petData.hp; // 实际应该从战斗状态获取
        
        const fillNode = this.hpBarNode.getChildByName('Fill');
        if (fillNode) {
            const ratio = currentHp / maxHp;
            fillNode.scaleX = Math.max(0, ratio);
            
            // 根据血量改变颜色
            const sprite = fillNode.getComponent(cc.Sprite);
            if (sprite) {
                if (ratio > 0.5) {
                    sprite.node.color = cc.Color.GREEN;
                } else if (ratio > 0.25) {
                    sprite.node.color = cc.Color.YELLOW;
                } else {
                    sprite.node.color = cc.Color.RED;
                }
            }
        }
        
        if (this.hpLabel) {
            this.hpLabel.string = `${currentHp}/${maxHp}`;
        }
    }
    
    /**
     * 更新属性图标
     */
    private _updateElementIcon(): void {
        if (!this.elementIcon || !this._petData) return;
        
        const elementIcons = {
            'FIRE': 'textures/elements/fire',
            'WATER': 'textures/elements/water',
            'GRASS': 'textures/elements/grass',
            'LIGHT': 'textures/elements/light',
            'DARK': 'textures/elements/dark'
        };
        
        const iconPath = elementIcons[this._petData.element];
        if (iconPath) {
            cc.loader.loadRes(iconPath, cc.SpriteFrame, (err, spriteFrame) => {
                if (!err && this.elementIcon) {
                    this.elementIcon.spriteFrame = spriteFrame;
                }
            });
        }
    }
    
    /**
     * 更新稀有度边框
     */
    private _updateRarityBorder(): void {
        if (!this.rarityBorder || !this._petData) return;
        
        const rarityColors = {
            'N': cc.Color.GRAY,
            'R': cc.Color.GREEN,
            'SR': cc.Color.MAGENTA,
            'SSR': cc.Color.ORANGE
        };
        
        this.rarityBorder.node.color = rarityColors[this._petData.rarity] || cc.Color.WHITE;
    }
    
    /**
     * 播放攻击动画
     */
    public playAttackAnimation(callback?: () => void): void {
        if (this._animator) {
            this._animator.play('pet_attack');
            this._animator.on('finished', () => {
                if (callback) callback();
            }, this, true);
        } else {
            // 简单的位移动画作为备选
            cc.tween(this.node)
                .by(0.1, { x: 50 })
                .by(0.1, { x: -50 })
                .call(() => {
                    if (callback) callback();
                })
                .start();
        }
    }
    
    /**
     * 播放受击动画
     */
    public playHitAnimation(): void {
        if (this._animator) {
            this._animator.play('pet_hit');
        } else {
            cc.tween(this.node)
                .by(0.05, { x: -10 })
                .by(0.05, { x: 10 })
                .by(0.05, { x: -10 })
                .by(0.05, { x: 10 })
                .start();
        }
        
        // 闪烁效果
        const sprite = this.getComponent(cc.Sprite);
        if (sprite) {
            cc.tween(sprite.node)
                .to(0.1, { opacity: 128 })
                .to(0.1, { opacity: 255 })
                .start();
        }
    }
    
    /**
     * 播放死亡动画
     */
    public playDeathAnimation(callback?: () => void): void {
        if (this._animator) {
            this._animator.play('pet_death');
            this._animator.on('finished', () => {
                if (callback) callback();
            }, this, true);
        } else {
            cc.tween(this.node)
                .to(0.5, { opacity: 0, scale: 0.8 })
                .call(() => {
                    if (callback) callback();
                })
                .start();
        }
    }
    
    /**
     * 播放升级动画
     */
    public playLevelUpAnimation(): void {
        // 升级特效
        const effectNode = new cc.Node('LevelUpEffect');
        effectNode.setPosition(0, 50);
        this.node.addChild(effectNode);
        
        const label = effectNode.addComponent(cc.Label);
        label.string = 'LEVEL UP!';
        label.fontSize = 30;
        label.color = cc.Color.YELLOW;
        
        cc.tween(effectNode)
            .to(0.5, { y: 100, scale: 1.5 })
            .to(0.5, { opacity: 0 })
            .call(() => effectNode.destroy())
            .start();
        
        // 萌宠缩放动画
        cc.tween(this.node)
            .to(0.2, { scale: 1.2 })
            .to(0.2, { scale: 1.0 })
            .start();
    }
    
    /**
     * 设置选中状态
     */
    public setSelected(selected: boolean): void {
        if (this.selectEffect) {
            this.selectEffect.active = selected;
        }
        
        // 缩放效果
        cc.tween(this.node)
            .to(0.1, { scale: selected ? 1.1 : 1.0 })
            .start();
    }
    
    /**
     * 更新血量（战斗中）
     */
    public updateHP(currentHP: number, maxHP: number): void {
        if (this._petData) {
            this._petData.hp = currentHP;
        }
        this._updateHPBar();
    }
    
    /**
     * 显示伤害数字
     */
    public showDamage(damage: number, isCrit: boolean = false): void {
        const damageNode = new cc.Node('Damage');
        damageNode.setPosition(0, 50);
        this.node.addChild(damageNode);
        
        const label = damageNode.addComponent(cc.Label);
        label.string = damage.toString();
        label.fontSize = isCrit ? 40 : 30;
        label.color = isCrit ? cc.Color.RED : cc.Color.WHITE;
        
        if (isCrit) {
            label.node.scale = 1.5;
        }
        
        cc.tween(damageNode)
            .by(0.5, { y: 80 })
            .to(0.3, { opacity: 0 })
            .call(() => damageNode.destroy())
            .start();
    }
    
    /**
     * 显示治疗数字
     */
    public showHeal(amount: number): void {
        const healNode = new cc.Node('Heal');
        healNode.setPosition(0, 50);
        this.node.addChild(healNode);
        
        const label = healNode.addComponent(cc.Label);
        label.string = `+${amount}`;
        label.fontSize = 30;
        label.color = cc.Color.GREEN;
        
        cc.tween(healNode)
            .by(0.5, { y: 80 })
            .to(0.3, { opacity: 0 })
            .call(() => healNode.destroy())
            .start();
    }
}
