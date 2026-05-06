/**
 * 背包场景UI
 * 背包界面，包含萌宠列表、合成、上阵等功能
 */

import GameMain from '../GameMain';
import { Pet } from '../managers/PetManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BagSceneUI extends cc.Component {
    
    // UI组件引用
    @property(cc.Node)
    petListContent: cc.Node = null;
    
    @property(cc.Node)
    petDetailPanel: cc.Node = null;
    
    @property(cc.Node)
    mergePanel: cc.Node = null;
    
    @property(cc.Node)
    backButton: cc.Node = null;
    
    @property(cc.Node)
    mergeButton: cc.Node = null;
    
    @property(cc.Node)
    teamButton: cc.Node = null;
    
    @property(cc.Label)
    bagCountLabel: cc.Label = null;
    
    // 当前选中的萌宠
    private _selectedPet: Pet = null;
    private _selectedPetsForMerge: string[] = [];
    private _allPets: Pet[] = [];
    
    onLoad() {
        console.log('[BagSceneUI] 背包场景加载');
        this._initUI();
    }
    
    start() {
        this._refreshPetList();
    }
    
    /**
     * 初始化UI
     */
    private _initUI(): void {
        // 绑定按钮事件
        this.backButton.on(cc.Node.EventType.TOUCH_END, this._onBack, this);
        this.mergeButton.on(cc.Node.EventType.TOUCH_END, this._onMerge, this);
        this.teamButton.on(cc.Node.EventType.TOUCH_END, this._onSetTeam, this);
        
        // 隐藏面板
        this.petDetailPanel.active = false;
        this.mergePanel.active = false;
    }
    
    /**
     * 刷新萌宠列表
     */
    private _refreshPetList(): void {
        if (!GameMain.instance) return;
        
        // 获取所有萌宠
        this._allPets = GameMain.instance.petManager.getAllPets();
        
        // 清空列表
        this.petListContent.removeAllChildren();
        
        // 显示背包数量
        this.bagCountLabel.string = `${this._allPets.length}/100`;
        
        // 创建萌宠列表项
        this._allPets.forEach((pet, index) => {
            const item = this._createPetListItem(pet, index);
            this.petListContent.addChild(item);
        });
    }
    
    /**
     * 创建萌宠列表项
     */
    private _createPetListItem(pet: Pet, index: number): cc.Node {
        const item = new cc.Node('PetItem');
        item.setContentSize(600, 120);
        
        // 背景
        const bg = item.addComponent(cc.Sprite);
        // TODO: 设置列表项背景
        
        // 点击事件
        item.on(cc.Node.EventType.TOUCH_END, () => {
            this._onPetClick(pet);
        });
        
        // 萌宠图标
        const iconNode = new cc.Node('Icon');
        iconNode.setContentSize(80, 80);
        iconNode.setPosition(-250, 0);
        const iconSprite = iconNode.addComponent(cc.Sprite);
        // TODO: 设置萌宠图标
        item.addChild(iconNode);
        
        // 名称
        const nameNode = new cc.Node('Name');
        const nameLabel = nameNode.addComponent(cc.Label);
        nameLabel.string = pet.name;
        nameLabel.fontSize = 24;
        nameNode.setPosition(-150, 30);
        item.addChild(nameNode);
        
        // 等级
        const levelNode = new cc.Node('Level');
        const levelLabel = levelNode.addComponent(cc.Label);
        levelLabel.string = `Lv.${pet.level}`;
        levelLabel.fontSize = 20;
        levelLabel.color = cc.Color.YELLOW;
        levelNode.setPosition(-150, -10);
        item.addChild(levelNode);
        
        // 稀有度
        const rarityNode = new cc.Node('Rarity');
        const rarityLabel = rarityNode.addComponent(cc.Label);
        rarityLabel.string = pet.rarity;
        rarityLabel.fontSize = 18;
        rarityLabel.color = this._getRarityColor(pet.rarity);
        rarityNode.setPosition(-150, -40);
        item.addChild(rarityNode);
        
        // 属性
        const elementNode = new cc.Node('Element');
        const elementLabel = elementNode.addComponent(cc.Label);
        elementLabel.string = pet.element;
        elementLabel.fontSize = 18;
        elementNode.setPosition(-50, 0);
        item.addChild(elementNode);
        
        // 属性值
        const statsNode = new cc.Node('Stats');
        const statsLabel = statsNode.addComponent(cc.Label);
        statsLabel.string = `ATK:${pet.atk} HP:${pet.hp}`;
        statsLabel.fontSize = 18;
        statsNode.setPosition(100, 0);
        item.addChild(statsNode);
        
        // 上阵标记
        const team = GameMain.instance?.petManager.getTeam();
        if (team?.some(p => p.id === pet.id)) {
            const teamMark = new cc.Node('TeamMark');
            const teamLabel = teamMark.addComponent(cc.Label);
            teamLabel.string = '上阵';
            teamLabel.fontSize = 16;
            teamLabel.color = cc.Color.GREEN;
            teamMark.setPosition(250, 0);
            item.addChild(teamMark);
        }
        
        return item;
    }
    
    /**
     * 点击萌宠
     */
    private _onPetClick(pet: Pet): void {
        console.log('[BagSceneUI] 点击萌宠:', pet.name);
        
        this._selectedPet = pet;
        this._showPetDetail(pet);
    }
    
    /**
     * 显示萌宠详情
     */
    private _showPetDetail(pet: Pet): void {
        this.petDetailPanel.active = true;
        
        // 更新详情面板内容
        const nameLabel = this.petDetailPanel.getChildByName('Name')?.getComponent(cc.Label);
        if (nameLabel) nameLabel.string = pet.name;
        
        const levelLabel = this.petDetailPanel.getChildByName('Level')?.getComponent(cc.Label);
        if (levelLabel) levelLabel.string = `Lv.${pet.level}`;
        
        const rarityLabel = this.petDetailPanel.getChildByName('Rarity')?.getComponent(cc.Label);
        if (rarityLabel) {
            rarityLabel.string = pet.rarity;
            rarityLabel.color = this._getRarityColor(pet.rarity);
        }
        
        const atkLabel = this.petDetailPanel.getChildByName('ATK')?.getComponent(cc.Label);
        if (atkLabel) atkLabel.string = `攻击力: ${pet.atk}`;
        
        const hpLabel = this.petDetailPanel.getChildByName('HP')?.getComponent(cc.Label);
        if (hpLabel) hpLabel.string = `生命值: ${pet.hp}`;
        
        const skillLabel = this.petDetailPanel.getChildByName('Skill')?.getComponent(cc.Label);
        if (skillLabel) skillLabel.string = `技能: ${pet.skill}`;
        
        // 设置按钮状态
        this.teamButton.getComponent(cc.Button).interactable = true;
        
        // 检查是否可以合成
        const samePets = this._allPets.filter(p => p.petId === pet.petId);
        this.mergeButton.getComponent(cc.Button).interactable = samePets.length >= 3;
    }
    
    /**
     * 点击合成按钮
     */
    private _onMerge(): void {
        if (!this._selectedPet) return;
        
        // 显示合成面板
        this._showMergePanel();
    }
    
    /**
     * 显示合成面板
     */
    private _showMergePanel(): void {
        this.mergePanel.active = true;
        
        // 获取相同萌宠
        const samePets = this._allPets.filter(p => p.petId === this._selectedPet.petId);
        
        // 清空选择
        this._selectedPetsForMerge = [];
        
        // 显示可选萌宠
        const content = this.mergePanel.getChildByName('Content');
        if (content) {
            content.removeAllChildren();
            
            samePets.forEach((pet, index) => {
                const node = this._createMergeSelectNode(pet, index);
                content.addChild(node);
            });
        }
        
        // 确认按钮
        const confirmBtn = this.mergePanel.getChildByName('ConfirmBtn');
        if (confirmBtn) {
            confirmBtn.getComponent(cc.Button).interactable = false;
            confirmBtn.off(cc.Node.EventType.TOUCH_END);
            confirmBtn.on(cc.Node.EventType.TOUCH_END, () => {
                this._confirmMerge();
            });
        }
    }
    
    /**
     * 创建合成选择节点
     */
    private _createMergeSelectNode(pet: Pet, index: number): cc.Node {
        const node = new cc.Node('MergeSelect');
        node.setPosition((index - 1) * 150, 0);
        
        // 背景
        const bg = node.addComponent(cc.Sprite);
        // TODO: 设置背景
        
        // 萌宠图标
        const iconNode = new cc.Node('Icon');
        const iconSprite = iconNode.addComponent(cc.Sprite);
        // TODO: 设置图标
        node.addChild(iconNode);
        
        // 等级
        const levelNode = new cc.Node('Level');
        const levelLabel = levelNode.addComponent(cc.Label);
        levelLabel.string = `Lv.${pet.level}`;
        levelLabel.fontSize = 18;
        levelNode.setPosition(0, -50);
        node.addChild(levelNode);
        
        // 选择状态
        const selectedMark = new cc.Node('Selected');
        selectedMark.active = false;
        const selectedLabel = selectedMark.addComponent(cc.Label);
        selectedLabel.string = '✓';
        selectedLabel.fontSize = 40;
        selectedLabel.color = cc.Color.GREEN;
        selectedMark.setPosition(30, 30);
        node.addChild(selectedMark);
        
        // 点击事件
        node.on(cc.Node.EventType.TOUCH_END, () => {
            const isSelected = this._toggleMergeSelection(pet.id);
            selectedMark.active = isSelected;
            
            // 更新确认按钮状态
            const confirmBtn = this.mergePanel.getChildByName('ConfirmBtn');
            if (confirmBtn) {
                confirmBtn.getComponent(cc.Button).interactable = this._selectedPetsForMerge.length === 3;
            }
        });
        
        return node;
    }
    
    /**
     * 切换合成选择
     */
    private _toggleMergeSelection(petId: string): boolean {
        const index = this._selectedPetsForMerge.indexOf(petId);
        
        if (index > -1) {
            // 取消选择
            this._selectedPetsForMerge.splice(index, 1);
            return false;
        } else if (this._selectedPetsForMerge.length < 3) {
            // 添加选择
            this._selectedPetsForMerge.push(petId);
            return true;
        }
        
        return false;
    }
    
    /**
     * 确认合成
     */
    private _confirmMerge(): void {
        if (this._selectedPetsForMerge.length !== 3) return;
        
        // 执行合成
        const newPetId = GameMain.instance?.petManager.merge(this._selectedPetsForMerge);
        
        if (newPetId) {
            this._showToast('合成成功！');
            this.mergePanel.active = false;
            this.petDetailPanel.active = false;
            this._refreshPetList();
        } else {
            this._showToast('合成失败');
        }
    }
    
    /**
     * 设置上阵
     */
    private _onSetTeam(): void {
        if (!this._selectedPet) return;
        
        // 获取当前阵容
        const currentTeam = GameMain.instance?.petManager.getTeam() || [];
        const teamIds = currentTeam.map(p => p.id);
        
        // 检查是否已上阵
        if (teamIds.includes(this._selectedPet.id)) {
            // 下阵
            const newTeam = teamIds.filter(id => id !== this._selectedPet.id);
            GameMain.instance?.petManager.setTeam(newTeam);
            this._showToast('已下阵');
        } else {
            // 上阵
            if (teamIds.length >= 3) {
                this._showToast('阵容已满，请先下阵其他萌宠');
                return;
            }
            
            teamIds.push(this._selectedPet.id);
            GameMain.instance?.petManager.setTeam(teamIds);
            this._showToast('已上阵');
        }
        
        this._refreshPetList();
        this.petDetailPanel.active = false;
    }
    
    /**
     * 返回主场景
     */
    private _onBack(): void {
        GameMain.instance?.audioManager.playButtonClick();
        GameMain.instance?.enterScene('MainScene');
    }
    
    /**
     * 获取稀有度颜色
     */
    private _getRarityColor(rarity: string): cc.Color {
        const colors = {
            'N': cc.Color.GRAY,
            'R': cc.Color.GREEN,
            'SR': cc.Color.MAGENTA,
            'SSR': cc.Color.ORANGE
        };
        return colors[rarity] || cc.Color.WHITE;
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
