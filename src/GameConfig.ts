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

// 萌宠基础数据
export const PET_DATA = [
    // N级萌宠
    { id: 'n001', name: '小火苗', rarity: 'N', element: 'FIRE', atk: 10, hp: 50, skill: '火球术' },
    { id: 'n002', name: '水滴仔', rarity: 'N', element: 'WATER', atk: 8, hp: 60, skill: '水枪' },
    { id: 'n003', name: '绿叶怪', rarity: 'N', element: 'GRASS', atk: 9, hp: 55, skill: '飞叶快刀' },
    { id: 'n004', name: '闪电鼠', rarity: 'N', element: 'FIRE', atk: 12, hp: 45, skill: '电击' },
    { id: 'n005', name: '泡泡鱼', rarity: 'N', element: 'WATER', atk: 7, hp: 65, skill: '泡沫' },
    
    // R级萌宠
    { id: 'r001', name: '火焰喵', rarity: 'R', element: 'FIRE', atk: 20, hp: 100, skill: '火焰喷射' },
    { id: 'r002', name: '冰霜兔', rarity: 'R', element: 'WATER', atk: 18, hp: 110, skill: '冰冻陷阱' },
    { id: 'r003', name: '雷霆熊', rarity: 'R', element: 'FIRE', atk: 25, hp: 90, skill: '闪电链' },
    { id: 'r004', name: '治愈狐', rarity: 'R', element: 'LIGHT', atk: 15, hp: 120, skill: '群体治疗' },
    { id: 'r005', name: '暗影狼', rarity: 'R', element: 'DARK', atk: 22, hp: 95, skill: '暗影突袭' },
    
    // SR级萌宠
    { id: 'sr001', name: '凤凰', rarity: 'SR', element: 'FIRE', atk: 45, hp: 200, skill: '涅槃重生' },
    { id: 'sr002', name: '冰龙', rarity: 'SR', element: 'WATER', atk: 40, hp: 220, skill: '绝对零度' },
    { id: 'sr003', name: '雷麒麟', rarity: 'SR', element: 'FIRE', atk: 50, hp: 180, skill: '雷霆万钧' },
    
    // SSR级萌宠
    { id: 'ssr001', name: '圣光天使', rarity: 'SSR', element: 'LIGHT', atk: 80, hp: 400, skill: '神圣审判' },
    { id: 'ssr002', name: '暗黑魔王', rarity: 'SSR', element: 'DARK', atk: 90, hp: 350, skill: '毁灭黑洞' }
];

// 技能数据
export const SKILL_DATA = [
    { id: 's001', name: '攻击力+10%', type: 'buff', effect: { atk: 0.1 } },
    { id: 's002', name: '生命值+15%', type: 'buff', effect: { hp: 0.15 } },
    { id: 's003', name: '暴击率+20%', type: 'buff', effect: { crit: 0.2 } },
    { id: 's004', name: '火属性强化', type: 'element', effect: { fire: 0.3 } },
    { id: 's005', name: '水属性强化', type: 'element', effect: { water: 0.3 } },
    { id: 's006', name: '吸血+10%', type: 'special', effect: { lifesteal: 0.1 } }
];
