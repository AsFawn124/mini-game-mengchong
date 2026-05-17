/**
 * 游戏配置
 * 所有游戏参数集中管理
 */

export const GameConfig = {
    // 游戏基础信息
    GAME_NAME: '萌宠大冒险',
    VERSION: '1.0.0',
    
    // 屏幕适配
    DESIGN_WIDTH: 750,
    DESIGN_HEIGHT: 1334,
    
    // 游戏数值
    MAX_TEAM_SIZE: 3,           // 最大上阵萌宠数
    MAX_BAG_SIZE: 100,          // 背包容量
    BASE_GACHA_COST: 100,       // 基础抽卡消耗
    GACHA_COST_10: 900,         // 十连抽消耗
    
    // 战斗配置
    BATTLE_WAVE_INTERVAL: 3,    // 每3波选择一次技能
    MAX_WAVES: 50,              // 最大波数
    
    // 稀有度配置
    RARITY: {
        N: { name: '普通', color: '#9E9E9E', rate: 0.50 },
        R: { name: '稀有', color: '#4CAF50', rate: 0.30 },
        SR: { name: '史诗', color: '#9C27B0', rate: 0.15 },
        SSR: { name: '传说', color: '#FF9800', rate: 0.05 }
    },
    
    // 属性克制
    ELEMENTS: {
        FIRE: { name: '火', strong: 'GRASS', weak: 'WATER' },
        WATER: { name: '水', strong: 'FIRE', weak: 'GRASS' },
        GRASS: { name: '草', strong: 'WATER', weak: 'FIRE' },
        LIGHT: { name: '光', strong: 'DARK', weak: 'DARK' },
        DARK: { name: '暗', strong: 'LIGHT', weak: 'LIGHT' }
    },
    
    // 微信配置
    WECHAT: {
        APP_ID: 'wx8e1435739bbdf94d',
        ENV_ID: 'your-cloud-env-id'  // 需要替换为实际的云开发环境ID
    }
};

// 萌宠基础数据 - 完整50只萌宠配置
export const PET_DATA = [
    // N级萌宠 (20只)
    { id: 'pet_001', name: '小火苗', rarity: 'N', element: 'FIRE', atk: 10, hp: 50, skill: '火球术', image: 'pets_png/pet_001_lv1.png' },
    { id: 'pet_002', name: '水滴仔', rarity: 'N', element: 'WATER', atk: 8, hp: 60, skill: '水枪', image: 'pets_png/pet_002_lv1.png' },
    { id: 'pet_003', name: '绿叶怪', rarity: 'N', element: 'GRASS', atk: 9, hp: 55, skill: '飞叶快刀', image: 'pets_png/pet_003_lv1.png' },
    { id: 'pet_004', name: '闪电鼠', rarity: 'N', element: 'FIRE', atk: 12, hp: 45, skill: '电击', image: 'pets_png/pet_004_lv1.png' },
    { id: 'pet_005', name: '泡泡鱼', rarity: 'N', element: 'WATER', atk: 7, hp: 65, skill: '泡沫', image: 'pets_png/pet_005_lv1.png' },
    { id: 'pet_021', name: '土拨鼠', rarity: 'N', element: 'GRASS', atk: 9, hp: 58, skill: '挖洞', image: 'pets_new/N/pet_021.png' },
    { id: 'pet_022', name: '风铃鸟', rarity: 'N', element: 'GRASS', atk: 11, hp: 48, skill: '风刃', image: 'pets_new/N/pet_022.png' },
    { id: 'pet_023', name: '岩石龟', rarity: 'N', element: 'GRASS', atk: 7, hp: 70, skill: '岩石护盾', image: 'pets_new/N/pet_023.png' },
    { id: 'pet_024', name: '电火花', rarity: 'N', element: 'FIRE', atk: 13, hp: 42, skill: '火花', image: 'pets_new/N/pet_024.png' },
    { id: 'pet_025', name: '水母漂', rarity: 'N', element: 'WATER', atk: 8, hp: 62, skill: '麻痹触手', image: 'pets_new/N/pet_025.png' },
    { id: 'pet_026', name: '小火龙', rarity: 'N', element: 'FIRE', atk: 11, hp: 52, skill: '小火苗', image: 'pets_new/N/pet_026.png' },
    { id: 'pet_027', name: '小水滴', rarity: 'N', element: 'WATER', atk: 7, hp: 64, skill: '治愈水滴', image: 'pets_new/N/pet_027.png' },
    { id: 'pet_028', name: '小树苗', rarity: 'N', element: 'GRASS', atk: 8, hp: 60, skill: '生长', image: 'pets_new/N/pet_028.png' },
    { id: 'pet_029', name: '小蝙蝠', rarity: 'N', element: 'DARK', atk: 10, hp: 50, skill: '吸血', image: 'pets_new/N/pet_029.png' },
    { id: 'pet_030', name: '小萤火虫', rarity: 'N', element: 'LIGHT', atk: 9, hp: 54, skill: '闪光', image: 'pets_new/N/pet_030.png' },
    
    // R级萌宠 (15只)
    { id: 'pet_006', name: '火焰喵', rarity: 'R', element: 'FIRE', atk: 20, hp: 100, skill: '火焰喷射', image: 'pets_png/pet_006_lv1.png' },
    { id: 'pet_007', name: '冰霜兔', rarity: 'R', element: 'WATER', atk: 18, hp: 110, skill: '冰冻陷阱', image: 'pets_png/pet_007_lv1.png' },
    { id: 'pet_008', name: '雷霆熊', rarity: 'R', element: 'FIRE', atk: 25, hp: 90, skill: '闪电链', image: 'pets_png/pet_008_lv1.png' },
    { id: 'pet_009', name: '治愈狐', rarity: 'R', element: 'LIGHT', atk: 15, hp: 120, skill: '群体治疗', image: 'pets_png/pet_009_lv1.png' },
    { id: 'pet_010', name: '暗影狼', rarity: 'R', element: 'DARK', atk: 22, hp: 95, skill: '暗影突袭', image: 'pets_png/pet_010_lv1.png' },
    { id: 'pet_031', name: '火焰狮', rarity: 'R', element: 'FIRE', atk: 24, hp: 105, skill: '烈焰咆哮', image: 'pets_new/R/pet_031.png' },
    { id: 'pet_032', name: '深海鲸', rarity: 'R', element: 'WATER', atk: 19, hp: 130, skill: '深海冲击', image: 'pets_new/R/pet_032.png' },
    { id: 'pet_033', name: '森林鹿', rarity: 'R', element: 'GRASS', atk: 17, hp: 115, skill: '自然祝福', image: 'pets_new/R/pet_033.png' },
    { id: 'pet_034', name: '雷鹰', rarity: 'R', element: 'FIRE', atk: 26, hp: 95, skill: '雷霆俯冲', image: 'pets_new/R/pet_034.png' },
    { id: 'pet_035', name: '圣骑士', rarity: 'R', element: 'LIGHT', atk: 21, hp: 125, skill: '圣光护盾', image: 'pets_new/R/pet_035.png' },
    { id: 'pet_036', name: '刺客猫', rarity: 'R', element: 'DARK', atk: 28, hp: 85, skill: '暗影步', image: 'pets_new/R/pet_036.png' },
    { id: 'pet_037', name: '岩浆兽', rarity: 'R', element: 'FIRE', atk: 23, hp: 110, skill: '岩浆爆发', image: 'pets_new/R/pet_037.png' },
    { id: 'pet_038', name: '冰晶蝶', rarity: 'R', element: 'WATER', atk: 16, hp: 120, skill: '冰晶风暴', image: 'pets_new/R/pet_038.png' },
    { id: 'pet_039', name: '毒藤花', rarity: 'R', element: 'GRASS', atk: 20, hp: 100, skill: '剧毒藤蔓', image: 'pets_new/R/pet_039.png' },
    { id: 'pet_040', name: '幻影狐', rarity: 'R', element: 'DARK', atk: 24, hp: 92, skill: '幻影分身', image: 'pets_new/R/pet_040.png' },
    
    // SR级萌宠 (10只)
    { id: 'pet_011', name: '凤凰', rarity: 'SR', element: 'FIRE', atk: 45, hp: 200, skill: '涅槃重生', image: 'pets_png/pet_011_lv1.png' },
    { id: 'pet_012', name: '冰龙', rarity: 'SR', element: 'WATER', atk: 40, hp: 220, skill: '绝对零度', image: 'pets_png/pet_012_lv1.png' },
    { id: 'pet_013', name: '雷麒麟', rarity: 'SR', element: 'FIRE', atk: 50, hp: 180, skill: '雷霆万钧', image: 'pets_png/pet_013_lv1.png' },
    { id: 'pet_014', name: '光天使', rarity: 'SR', element: 'LIGHT', atk: 35, hp: 250, skill: '圣光普照', image: 'pets_png/pet_014_lv1.png' },
    { id: 'pet_015', name: '暗恶魔', rarity: 'SR', element: 'DARK', atk: 55, hp: 170, skill: '黑暗吞噬', image: 'pets_png/pet_015_lv1.png' },
    { id: 'pet_041', name: '炎魔', rarity: 'SR', element: 'FIRE', atk: 48, hp: 190, skill: '地狱之火', image: 'pets_new/SR/pet_041.png' },
    { id: 'pet_042', name: '海皇', rarity: 'SR', element: 'WATER', atk: 42, hp: 240, skill: '海啸', image: 'pets_new/SR/pet_042.png' },
    { id: 'pet_043', name: '树精王', rarity: 'SR', element: 'GRASS', atk: 38, hp: 260, skill: '自然之力', image: 'pets_new/SR/pet_043.png' },
    { id: 'pet_044', name: '雷神', rarity: 'SR', element: 'FIRE', atk: 52, hp: 175, skill: '天雷', image: 'pets_new/SR/pet_044.png' },
    { id: 'pet_045', name: '月神', rarity: 'SR', element: 'LIGHT', atk: 36, hp: 280, skill: '月光治愈', image: 'pets_new/SR/pet_045.png' },
    
    // SSR级萌宠 (5只)
    { id: 'pet_016', name: '圣光天使', rarity: 'SSR', element: 'LIGHT', atk: 80, hp: 400, skill: '神圣审判', image: 'pets_png/pet_016_lv1.png' },
    { id: 'pet_017', name: '暗黑魔王', rarity: 'SSR', element: 'DARK', atk: 90, hp: 350, skill: '毁灭黑洞', image: 'pets_png/pet_017_lv1.png' },
    { id: 'pet_018', name: '元素龙王', rarity: 'SSR', element: 'FIRE', atk: 85, hp: 450, skill: '元素风暴', image: 'pets_png/pet_018_lv1.png' },
    { id: 'pet_019', name: '时空神兽', rarity: 'SSR', element: 'LIGHT', atk: 75, hp: 500, skill: '时空扭曲', image: 'pets_png/pet_019_lv1.png' },
    { id: 'pet_020', name: '创世神', rarity: 'SSR', element: 'LIGHT', atk: 100, hp: 600, skill: '创世之光', image: 'pets_png/pet_020_lv1.png' },
    { id: 'pet_046', name: '太阳神', rarity: 'SSR', element: 'FIRE', atk: 95, hp: 380, skill: '太阳耀斑', image: 'pets_new/SSR/pet_046.png' },
    { id: 'pet_047', name: '冥王', rarity: 'SSR', element: 'DARK', atk: 88, hp: 420, skill: '冥界召唤', image: 'pets_new/SSR/pet_047.png' },
    { id: 'pet_048', name: '风神', rarity: 'SSR', element: 'GRASS', atk: 82, hp: 440, skill: '风神之怒', image: 'pets_new/SSR/pet_048.png' },
    { id: 'pet_049', name: '海神', rarity: 'SSR', element: 'WATER', atk: 78, hp: 480, skill: '深海之怒', image: 'pets_new/SSR/pet_049.png' },
    { id: 'pet_050', name: '宇宙龙', rarity: 'SSR', element: 'LIGHT', atk: 110, hp: 550, skill: '宇宙大爆炸', image: 'pets_new/SSR/pet_050.png' }
];

// 技能数据
export const SKILL_DATA = [
    { id: 's001', name: '攻击力+10%', type: 'buff', effect: { atk: 0.1 } },
    { id: 's002', name: '生命值+15%', type: 'buff', effect: { hp: 0.15 } },
    { id: 's003', name: '暴击率+20%', type: 'buff', effect: { crit: 0.2 } },
    { id: 's004', name: '火属性强化', type: 'element', effect: { fire: 0.3 } },
    { id: 's005', name: '水属性强化', type: 'element', effect: { water: 0.3 } },
    { id: 's006', name: '草属性强化', type: 'element', effect: { grass: 0.3 } },
    { id: 's007', name: '光属性强化', type: 'element', effect: { light: 0.3 } },
    { id: 's008', name: '暗属性强化', type: 'element', effect: { dark: 0.3 } },
    { id: 's009', name: '吸血+10%', type: 'special', effect: { lifesteal: 0.1 } },
    { id: 's010', name: '攻速+15%', type: 'buff', effect: { speed: 0.15 } },
    { id: 's011', name: '防御+20%', type: 'buff', effect: { def: 0.2 } },
    { id: 's012', name: '复活一次', type: 'special', effect: { revive: 1 } }
];

// 萌宠获取配置
export const PET_OBTAIN_CONFIG = {
    // 抽卡概率
    gachaRates: {
        N: 0.60,
        R: 0.25,
        SR: 0.12,
        SSR: 0.03
    },
    // 保底配置
    pity: {
        SR: 30,   // 30抽必出SR
        SSR: 100  // 100抽必出SSR
    }
};

// 游戏数值配置
export const GAME_BALANCE = {
    // 升级经验需求
    levelExp: [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250],
    // 合成消耗
    mergeCost: {
        N: 100,
        R: 500,
        SR: 2000,
        SSR: 10000
    },
    // 出售价格
    sellPrice: {
        N: 50,
        R: 250,
        SR: 1000,
        SSR: 5000
    }
};