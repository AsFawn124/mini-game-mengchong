// 游戏配置
export const GameConfig = {
    // 游戏基础设置
    GAME_NAME: "萌宠大冒险",
    VERSION: "1.0.0",
    
    // 战斗设置
    BATTLE: {
        AUTO_ATTACK_INTERVAL: 1.0,  // 自动攻击间隔（秒）
        SKILL_SELECT_INTERVAL: 3,    // 每3波选择技能
        MAX_WAVES: 999,              // 无尽模式最大波数
    },
    
    // 萌宠设置
    PET: {
        MAX_TEAM_SIZE: 3,           // 最大出战数量
        MAX_LEVEL: 100,             // 最大等级
        RARITY: {
            N: { rate: 0.6, color: '#9E9E9E' },
            R: { rate: 0.25, color: '#4CAF50' },
            SR: { rate: 0.12, color: '#2196F3' },
            SSR: { rate: 0.03, color: '#FF9800' }
        }
    },
    
    // 抽卡设置
    GACHA: {
        SINGLE_COST: 100,           // 单抽钻石
        TEN_COST: 900,              // 十抽钻石
        PITY_SR: 30,                // SR保底
        PITY_SSR: 100               // SSR保底
    },
    
    // 广告设置
    AD: {
        REVIVE_REWARD: 50,          // 复活奖励钻石
        DOUBLE_REWARD: true,        // 双倍奖励
        DAILY_LIMIT: 10             // 每日观看上限
    },
    
    // 数值配置
    ECONOMY: {
        START_DIAMONDS: 300,        // 初始钻石
        START_ENERGY: 50,           // 初始体力
        ENERGY_RECOVER_TIME: 300,   // 体力恢复时间（秒）
        MAX_ENERGY: 100             // 最大体力
    }
};

// 属性克制关系
export const ElementRelation = {
    FIRE: { strong: 'GRASS', weak: 'WATER' },
    WATER: { strong: 'FIRE', weak: 'GRASS' },
    GRASS: { strong: 'WATER', weak: 'FIRE' },
    LIGHT: { strong: 'DARK', weak: null },
    DARK: { strong: 'LIGHT', weak: null }
};

// 游戏事件
export const GameEvent = {
    BATTLE_START: 'battle_start',
    BATTLE_END: 'battle_end',
    WAVE_CLEAR: 'wave_clear',
    SKILL_SELECT: 'skill_select',
    PET_UPGRADE: 'pet_upgrade',
    GACHA_RESULT: 'gacha_result'
};