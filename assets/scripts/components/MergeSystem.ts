import { _decorator, Component, Node, Prefab, instantiate, Vec3, EventTouch } from 'cc';
import { PetEntity } from '../components/PetEntity';
import { PetManager } from '../managers/PetManager';

const { ccclass, property } = _decorator;

/**
 * 合成系统
 * 负责处理萌宠的拖拽、合成逻辑
 */
@ccclass('MergeSystem')
export class MergeSystem extends Component {
    
    @property(Prefab)
    petPrefab: Prefab = null;              // 萌宠预制体
    
    @property(Node)
    gridContainer: Node = null;            // 格子容器
    
    // 格子配置
    private readonly GRID_ROWS = 5;
    private readonly GRID_COLS = 5;
    private readonly CELL_SIZE = 120;
    
    // 格子数据
    private gridData: (PetEntity | null)[][] = [];
    
    // 拖拽状态
    private draggedPet: PetEntity = null;
    private startGridPos: { row: number, col: number } = null;
    
    onLoad() {
        this.initGrid();
        this.spawnInitialPets();
    }
    
    /**
     * 初始化格子
     */
    private initGrid(): void {
        for (let row = 0; row < this.GRID_ROWS; row++) {
            this.gridData[row] = [];
            for (let col = 0; col < this.GRID_COLS; col++) {
                this.gridData[row][col] = null;
            }
        }
    }
    
    /**
     * 生成初始萌宠
     */
    private spawnInitialPets(): void {
        // 在随机位置生成3个1级萌宠
        for (let i = 0; i < 3; i++) {
            const row = Math.floor(Math.random() * this.GRID_ROWS);
            const col = Math.floor(Math.random() * this.GRID_COLS);
            
            if (!this.gridData[row][col]) {
                this.spawnPetAt(row, col, 'pet_001', 1);
            }
        }
    }
    
    /**
     * 在指定位置生成萌宠
     */
    private spawnPetAt(row: number, col: number, petId: string, level: number): PetEntity {
        if (!this.petPrefab || !this.gridContainer) return null;
        
        const petNode = instantiate(this.petPrefab);
        petNode.parent = this.gridContainer;
        
        // 计算位置
        const pos = this.getGridPosition(row, col);
        petNode.setPosition(pos.x, pos.y, 0);
        
        // 初始化萌宠
        const petEntity = petNode.getComponent(PetEntity);
        if (petEntity) {
            const petData = {
                id: petId,
                name: `萌宠${petId}`,
                level: level,
                rarity: 'N'
            };
            petEntity.init(petData);
            petEntity.playSpawnAnimation();
            
            // 监听合成事件
            petNode.on('pet-drop', this.onPetDrop, this);
        }
        
        this.gridData[row][col] = petEntity;
        return petEntity;
    }
    
    /**
     * 获取格子位置
     */
    private getGridPosition(row: number, col: number): Vec3 {
        const startX = -(this.GRID_COLS * this.CELL_SIZE) / 2 + this.CELL_SIZE / 2;
        const startY = (this.GRID_ROWS * this.CELL_SIZE) / 2 - this.CELL_SIZE / 2;
        
        return new Vec3(
            startX + col * this.CELL_SIZE,
            startY - row * this.CELL_SIZE,
            0
        );
    }
    
    /**
     * 获取格子坐标
     */
    private getGridCoord(worldPos: Vec3): { row: number, col: number } | null {
        const startX = -(this.GRID_COLS * this.CELL_SIZE) / 2 + this.CELL_SIZE / 2;
        const startY = (this.GRID_ROWS * this.CELL_SIZE) / 2 - this.CELL_SIZE / 2;
        
        const col = Math.round((worldPos.x - startX) / this.CELL_SIZE);
        const row = Math.round((startY - worldPos.y) / this.CELL_SIZE);
        
        if (row >= 0 && row < this.GRID_ROWS && col >= 0 && col < this.GRID_COLS) {
            return { row, col };
        }
        return null;
    }
    
    /**
     * 萌宠放下事件
     */
    private onPetDrop(petEntity: PetEntity): void {
        const worldPos = petEntity.node.worldPosition;
        const gridCoord = this.getGridCoord(worldPos);
        
        if (!gridCoord) {
            // 放回原来的位置
            this.returnToOriginalPosition(petEntity);
            return;
        }
        
        const { row, col } = gridCoord;
        const targetPet = this.gridData[row][col];
        
        if (targetPet === petEntity) {
            // 放回原位
            this.snapToGrid(petEntity, row, col);
        } else if (targetPet === null) {
            // 移动到空格
            this.movePetToGrid(petEntity, row, col);
        } else {
            // 尝试合成
            this.tryMerge(petEntity, targetPet, row, col);
        }
    }
    
    /**
     * 尝试合成
     */
    private tryMerge(sourcePet: PetEntity, targetPet: PetEntity, row: number, col: number): void {
        // 检查是否可以合成（相同ID和等级）
        if (sourcePet.getPetId() === targetPet.getPetId() && 
            sourcePet.getLevel() === targetPet.getLevel()) {
            
            // 播放合成动画
            sourcePet.playMergeAnimation();
            targetPet.playMergeAnimation();
            
            // 清除原位置
            this.clearGridPosition(sourcePet);
            this.clearGridPosition(targetPet);
            
            // 生成高级萌宠
            setTimeout(() => {
                this.spawnPetAt(row, col, sourcePet.getPetId(), sourcePet.getLevel() + 1);
                
                // 发送合成成功事件
                this.node.emit('merge-success', {
                    petId: sourcePet.getPetId(),
                    newLevel: sourcePet.getLevel() + 1
                });
            }, 300);
        } else {
            // 无法合成，放回原位
            this.returnToOriginalPosition(sourcePet);
        }
    }
    
    /**
     * 移动萌宠到格子
     */
    private movePetToGrid(petEntity: PetEntity, row: number, col: number): void {
        // 清除原位置
        this.clearGridPosition(petEntity);
        
        // 设置新位置
        this.gridData[row][col] = petEntity;
        this.snapToGrid(petEntity, row, col);
    }
    
    /**
     * 清除格子位置
     */
    private clearGridPosition(petEntity: PetEntity): void {
        for (let row = 0; row < this.GRID_ROWS; row++) {
            for (let col = 0; col < this.GRID_COLS; col++) {
                if (this.gridData[row][col] === petEntity) {
                    this.gridData[row][col] = null;
                    return;
                }
            }
        }
    }
    
    /**
     * 吸附到格子
     */
    private snapToGrid(petEntity: PetEntity, row: number, col: number): void {
        const pos = this.getGridPosition(row, col);
        petEntity.node.setPosition(pos.x, pos.y, 0);
    }
    
    /**
     * 返回原位置
     */
    private returnToOriginalPosition(petEntity: PetEntity): void {
        // 找到萌宠所在的格子
        for (let row = 0; row < this.GRID_ROWS; row++) {
            for (let col = 0; col < this.GRID_COLS; col++) {
                if (this.gridData[row][col] === petEntity) {
                    this.snapToGrid(petEntity, row, col);
                    return;
                }
            }
        }
    }
    
    /**
     * 在随机空格生成新萌宠
     */
    spawnNewPet(): boolean {
        const emptyCells: { row: number, col: number }[] = [];
        
        for (let row = 0; row < this.GRID_ROWS; row++) {
            for (let col = 0; col < this.GRID_COLS; col++) {
                if (!this.gridData[row][col]) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length === 0) return false;
        
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.spawnPetAt(randomCell.row, randomCell.col, 'pet_001', 1);
        return true;
    }
    
    /**
     * 检查是否还有空格
     */
    hasEmptyCell(): boolean {
        for (let row = 0; row < this.GRID_ROWS; row++) {
            for (let col = 0; col < this.GRID_COLS; col++) {
                if (!this.gridData[row][col]) {
                    return true;
                }
            }
        }
        return false;
    }
}