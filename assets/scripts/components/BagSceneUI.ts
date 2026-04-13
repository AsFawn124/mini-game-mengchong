import { _decorator, Component, Node, Label, Button, ScrollView, Prefab, instantiate } from 'cc';
import { PetManager, PetData } from '../managers/PetManager';
import { AudioManager } from '../managers/AudioManager';

const { ccclass, property } = _decorator;

/**
 * 背包场景UI
 * 显示和管理玩家拥有的萌宠
 */
@ccclass('BagSceneUI')
export class BagSceneUI extends Component {
    
    @property(Label)
    petCountLabel: Label = null;       // 萌宠数量显示
    
    @property(Button)
    backBtn: Button = null;            // 返回按钮
    
    @property(ScrollView)
    petScrollView: ScrollView = null;  // 萌宠列表
    
    @property(Prefab)
    petItemPrefab: Prefab = null;      // 萌宠项预制体
    
    @property(Node)
    detailPanel: Node = null;          // 详情面板
    
    // 当前选中的萌宠
    private selectedPet: PetData = null;
    
    // 筛选条件
    private currentFilter: 'all' | 'N' | 'R' | 'SR' | 'SSR' = 'all';
    
    onLoad() {
        this.bindEvents();
        this.refreshPetList();
    }
    
    /**
     * 绑定按钮事件
     */
    private bindEvents(): void {
        if (this.backBtn) {
            this.backBtn.node.on(Button.EventType.CLICK, this.onBack, this);
        }
    }
    
    /**
     * 刷新萌宠列表
     */
    private refreshPetList(): void {
        const pets = PetManager.instance.getOwnedPets();
        
        // 更新数量显示
        if (this.petCountLabel) {
            this.petCountLabel.string = `萌宠: ${pets.length}/200`;
        }
        
        // 清空列表
        const content = this.petScrollView?.content;
        if (!content) return;
        
        content.removeAllChildren();
        
        // 筛选萌宠
        const filteredPets = this.currentFilter === 'all' 
            ? pets 
            : pets.filter(pet => pet.rarity === this.currentFilter);
        
        // 按稀有度排序
        const rarityOrder = { 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };
        filteredPets.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
        
        // 创建列表项
        filteredPets.forEach(pet => {
            this.createPetItem(pet, content);
        });
    }
    
    /**
     * 创建萌宠列表项
     */
    private createPetItem(pet: PetData, parent: Node): void {
        if (!this.petItemPrefab) return;
        
        const itemNode = instantiate(this.petItemPrefab);
        itemNode.parent = parent;
        
        // 设置萌宠信息
        const nameLabel = itemNode.getChildByName('NameLabel')?.getComponent(Label);
        const rarityLabel = itemNode.getChildByName('RarityLabel')?.getComponent(Label);
        const levelLabel = itemNode.getChildByName('LevelLabel')?.getComponent(Label);
        
        if (nameLabel) nameLabel.string = pet.name;
        if (rarityLabel) rarityLabel.string = pet.rarity;
        if (levelLabel) levelLabel.string = `Lv.${pet.level}`;
        
        // 设置稀有度颜色
        const rarityColors: { [key: string]: string } = {
            'N': '#9E9E9E',
            'R': '#4CAF50',
            'SR': '#2196F3',
            'SSR': '#FF9800'
        };
        if (rarityLabel) {
            rarityLabel.color = new (require('cc')).Color().fromHEX(rarityColors[pet.rarity]);
        }
        
        // 点击事件
        itemNode.on(Node.EventType.TOUCH_END, () => {
            this.onPetClick(pet);
        }, this);
    }
    
    /**
     * 萌宠点击
     */
    private onPetClick(pet: PetData): void {
        this.selectedPet = pet;
        
        // 播放音效
        AudioManager.instance?.playSFX(AudioManager.SFX.BUTTON_CLICK);
        
        // 显示详情
        this.showPetDetail(pet);
    }
    
    /**
     * 显示萌宠详情
     */
    private showPetDetail(pet: PetData): void {
        if (!this.detailPanel) return;
        
        this.detailPanel.active = true;
        
        // 设置详情信息
        const nameLabel = this.detailPanel.getChildByName('NameLabel')?.getComponent(Label);
        const rarityLabel = this.detailPanel.getChildByName('RarityLabel')?.getComponent(Label);
        const levelLabel = this.detailPanel.getChildByName('LevelLabel')?.getComponent(Label);
        const attackLabel = this.detailPanel.getChildByName('AttackLabel')?.getComponent(Label);
        const defenseLabel = this.detailPanel.getChildByName('DefenseLabel')?.getComponent(Label);
        const hpLabel = this.detailPanel.getChildByName('HpLabel')?.getComponent(Label);
        
        if (nameLabel) nameLabel.string = pet.name;
        if (rarityLabel) rarityLabel.string = `稀有度: ${pet.rarity}`;
        if (levelLabel) levelLabel.string = `等级: ${pet.level}`;
        if (attackLabel) attackLabel.string = `攻击: ${pet.attack}`;
        if (defenseLabel) defenseLabel.string = `防御: ${pet.defense}`;
        if (hpLabel) hpLabel.string = `生命: ${pet.hp}`;
    }
    
    /**
     * 筛选按钮点击
     */
    onFilterClick(filter: 'all' | 'N' | 'R' | 'SR' | 'SSR'): void {
        this.currentFilter = filter;
        this.refreshPetList();
    }
    
    /**
     * 升级按钮点击
     */
    onUpgradeClick(): void {
        if (!this.selectedPet) return;
        
        const success = PetManager.instance.upgradePet(this.selectedPet.id);
        if (success) {
            AudioManager.instance?.playSFX(AudioManager.SFX.LEVEL_UP);
            this.showMessage('升级成功！');
            this.refreshPetList();
            this.showPetDetail(this.selectedPet);
        } else {
            this.showMessage('经验不足或已达最高等级！');
        }
    }
    
    /**
     * 设为出战按钮点击
     */
    onSetBattleClick(): void {
        if (!this.selectedPet) return;
        
        // TODO: 设置出战阵容
        this.showMessage('已设为出战！');
    }
    
    /**
     * 关闭详情面板
     */
    onCloseDetail(): void {
        if (this.detailPanel) {
            this.detailPanel.active = false;
        }
        this.selectedPet = null;
    }
    
    /**
     * 返回主界面
     */
    private onBack(): void {
        const { director } = require('cc');
        director.loadScene('MainScene');
    }
    
    /**
     * 显示消息
     */
    private showMessage(msg: string): void {
        console.log(msg);
        // TODO: 显示Toast
    }
}