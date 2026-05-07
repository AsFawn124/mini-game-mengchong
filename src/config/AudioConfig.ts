/**
 * 音频配置
 * 定义所有游戏中使用的音效和背景音乐
 */

export enum BGMType {
    MAIN = 'bgm_main',           // 主界面
    BATTLE = 'bgm_battle',       // 战斗场景
    GACHA = 'bgm_gacha',         // 抽卡界面
    VICTORY = 'bgm_victory',     // 胜利结算
    DEFEAT = 'bgm_defeat',       // 失败结算
}

export enum SFXType {
    // UI音效
    CLICK = 'sfx_click',         // 按钮点击
    POPUP = 'sfx_popup',         // 弹窗出现
    CLOSE = 'sfx_close',         // 关闭界面
    
    // 游戏音效
    MERGE = 'sfx_merge',         // 合成成功
    LEVEL_UP = 'sfx_levelup',    // 升级
    GACHA = 'sfx_gacha',         // 抽卡转动
    GACHA_RARE = 'sfx_gacha_rare',   // 抽中稀有
    GACHA_SSR = 'sfx_gacha_ssr',     // 抽中SSR
    
    // 战斗音效
    ATTACK = 'sfx_attack',       // 普通攻击
    SKILL_FIRE = 'sfx_skill_fire',   // 火技能
    SKILL_ICE = 'sfx_skill_ice',     // 冰技能
    SKILL_THUNDER = 'sfx_skill_thunder', // 雷技能
    HIT = 'sfx_hit',             // 受击
    VICTORY = 'sfx_victory',     // 战斗胜利
    DEFEAT = 'sfx_defeat',       // 战斗失败
}

/**
 * 音频路径配置
 */
export const AudioPaths = {
    BGM: {
        [BGMType.MAIN]: 'audio/bgm_main',
        [BGMType.BATTLE]: 'audio/bgm_battle',
        [BGMType.GACHA]: 'audio/bgm_gacha',
        [BGMType.VICTORY]: 'audio/bgm_victory',
        [BGMType.DEFEAT]: 'audio/bgm_defeat',
    },
    
    SFX: {
        [SFXType.CLICK]: 'audio/sfx_click',
        [SFXType.POPUP]: 'audio/sfx_popup',
        [SFXType.CLOSE]: 'audio/sfx_close',
        [SFXType.MERGE]: 'audio/sfx_merge',
        [SFXType.LEVEL_UP]: 'audio/sfx_levelup',
        [SFXType.GACHA]: 'audio/sfx_gacha',
        [SFXType.GACHA_RARE]: 'audio/sfx_gacha_rare',
        [SFXType.GACHA_SSR]: 'audio/sfx_gacha_ssr',
        [SFXType.ATTACK]: 'audio/sfx_attack',
        [SFXType.SKILL_FIRE]: 'audio/sfx_skill_fire',
        [SFXType.SKILL_ICE]: 'audio/sfx_skill_ice',
        [SFXType.SKILL_THUNDER]: 'audio/sfx_skill_thunder',
        [SFXType.HIT]: 'audio/sfx_hit',
        [SFXType.VICTORY]: 'audio/sfx_victory',
        [SFXType.DEFEAT]: 'audio/sfx_defeat',
    }
};

/**
 * 场景BGM映射
 */
export const SceneBGMMap: { [sceneName: string]: BGMType } = {
    'MainScene': BGMType.MAIN,
    'BattleScene': BGMType.BATTLE,
    'GachaScene': BGMType.GACHA,
};

/**
 * 默认音量设置
 */
export const DefaultAudioSettings = {
    BGM_VOLUME: 0.5,      // 背景音乐音量 (0-1)
    SFX_VOLUME: 0.7,      // 音效音量 (0-1)
    IS_MUTED: false,      // 是否静音
};
