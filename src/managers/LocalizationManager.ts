/**
 * LocalizationManager - 多语言本地化系统
 * 支持简中/繁中/英/日/韩 5语
 * 对标商业游戏的国际化能力
 */

import { GameConfig } from '../GameConfig';

export enum Language {
    ZH_CN = 'zh-CN',     // 简体中文
    ZH_TW = 'zh-TW',     // 繁体中文
    EN = 'en',           // 英语
    JA = 'ja',           // 日语
    KO = 'ko'            // 韩语
}

export class LocalizationManager {
    private static instance: LocalizationManager;
    
    private currentLang: Language = Language.ZH_CN;
    private translations: Map<string, Map<Language, string>> = new Map();
    private fallbackLang: Language = Language.ZH_CN;

    private constructor() {
        this.loadTranslations();
        this.loadSavedLanguage();
    }

    public static getInstance(): LocalizationManager {
        if (!this.instance) this.instance = new LocalizationManager();
        return this.instance;
    }

    // ==================== 翻译数据库 ====================

    private loadTranslations(): void {
        // UI 通用
        this.add('start_game', { zhCN: '开始游戏', zhTW: '開始遊戲', en: 'Start Game', ja: 'ゲーム開始', ko: '게임 시작' });
        this.add('continue', { zhCN: '继续', zhTW: '繼續', en: 'Continue', ja: '続ける', ko: '계속' });
        this.add('settings', { zhCN: '设置', zhTW: '設定', en: 'Settings', ja: '設定', ko: '설정' });
        this.add('shop', { zhCN: '商店', zhTW: '商店', en: 'Shop', ja: 'ショップ', ko: '상점' });
        this.add('back', { zhCN: '返回', zhTW: '返回', en: 'Back', ja: '戻る', ko: '뒤로' });
        this.add('confirm', { zhCN: '确认', zhTW: '確認', en: 'Confirm', ja: '確認', ko: '확인' });
        this.add('cancel', { zhCN: '取消', zhTW: '取消', en: 'Cancel', ja: 'キャンセル', ko: '취소' });
        this.add('ok', { zhCN: '好的', zhTW: '好的', en: 'OK', ja: 'OK', ko: '확인' });
        this.add('close', { zhCN: '关闭', zhTW: '關閉', en: 'Close', ja: '閉じる', ko: '닫기' });
        this.add('loading', { zhCN: '加载中...', zhTW: '載入中...', en: 'Loading...', ja: 'ロード中...', ko: '로딩 중...' });
        this.add('network_error', { zhCN: '网络连接失败', zhTW: '網路連線失敗', en: 'Network Error', ja: 'ネットワークエラー', ko: '네트워크 오류' });
        this.add('retry', { zhCN: '重试', zhTW: '重試', en: 'Retry', ja: 'リトライ', ko: '재시도' });

        // 主菜单
        this.add('menu_battle', { zhCN: '对战', zhTW: '對戰', en: 'Battle', ja: 'バトル', ko: '전투' });
        this.add('menu_gacha', { zhCN: '抽卡', zhTW: '抽卡', en: 'Gacha', ja: 'ガチャ', ko: '뽑기' });
        this.add('menu_bag', { zhCN: '背包', zhTW: '背包', en: 'Bag', ja: 'バッグ', ko: '가방' });
        this.add('menu_pvp', { zhCN: '竞技场', zhTW: '競技場', en: 'Arena', ja: 'アリーナ', ko: '아레나' });
        this.add('menu_guild', { zhCN: '公会', zhTW: '公會', en: 'Guild', ja: 'ギルド', ko: '길드' });
        this.add('menu_world', { zhCN: '探索', zhTW: '探索', en: 'Explore', ja: '探検', ko: '탐험' });
        this.add('menu_event', { zhCN: '活动', zhTW: '活動', en: 'Event', ja: 'イベント', ko: '이벤트' });
        this.add('menu_mail', { zhCN: '邮件', zhTW: '郵件', en: 'Mail', ja: 'メール', ko: '우편' });
        this.add('menu_rank', { zhCN: '排行榜', zhTW: '排行榜', en: 'Ranking', ja: 'ランキング', ko: '랭킹' });
        this.add('menu_battlepass', { zhCN: '通行证', zhTW: '通行證', en: 'Battle Pass', ja: 'バトルパス', ko: '배틀패스' });

        // 战斗
        this.add('battle_start', { zhCN: '战斗开始!', zhTW: '戰鬥開始!', en: 'Battle Start!', ja: 'バトル開始!', ko: '전투 시작!' });
        this.add('victory', { zhCN: '胜利!', zhTW: '勝利!', en: 'Victory!', ja: '勝利!', ko: '승리!' });
        this.add('defeat', { zhCN: '失败', zhTW: '失敗', en: 'Defeat', ja: '敗北', ko: '패배' });
        this.add('battle_rewards', { zhCN: '战斗奖励', zhTW: '戰鬥獎勵', en: 'Battle Rewards', ja: 'バトル報酬', ko: '전투 보상' });
        this.add('exp_gained', { zhCN: '获得经验', zhTW: '獲得經驗', en: 'EXP Gained', ja: '獲得経験値', ko: '획득 경험치' });
        this.add('gold_gained', { zhCN: '获得金币', zhTW: '獲得金幣', en: 'Gold Gained', ja: '獲得ゴールド', ko: '획득 골드' });
        this.add('level_up', { zhCN: '等级提升!', zhTW: '等級提升!', en: 'Level Up!', ja: 'レベルアップ!', ko: '레벨 업!' });
        this.add('critical_hit', { zhCN: '暴击!', zhTW: '暴擊!', en: 'Critical!', ja: 'クリティカル!', ko: '치명타!' });
        this.add('super_effective', { zhCN: '效果拔群!', zhTW: '效果拔群!', en: 'Super Effective!', ja: '効果は抜群だ!', ko: '효과가 뛰어났다!' });

        // 萌宠相关
        this.add('pet_rarity_n', { zhCN: '普通', zhTW: '普通', en: 'Normal', ja: 'ノーマル', ko: '일반' });
        this.add('pet_rarity_r', { zhCN: '稀有', zhTW: '稀有', en: 'Rare', ja: 'レア', ko: '레어' });
        this.add('pet_rarity_sr', { zhCN: '超级稀有', zhTW: '超級稀有', en: 'Super Rare', ja: 'スーパーレア', ko: '슈퍼레어' });
        this.add('pet_rarity_ssr', { zhCN: '传说', zhTW: '傳說', en: 'Legendary', ja: 'レジェンダリー', ko: '전설' });
        this.add('pet_rarity_ur', { zhCN: '神话', zhTW: '神話', en: 'Mythic', ja: '神話', ko: '신화' });
        this.add('pet_evolve', { zhCN: '进化', zhTW: '進化', en: 'Evolve', ja: '進化', ko: '진화' });
        this.add('pet_fusion', { zhCN: '融合', zhTW: '融合', en: 'Fusion', ja: '融合', ko: '융합' });
        this.add('pet_breed', { zhCN: '繁衍', zhTW: '繁衍', en: 'Breed', ja: '繁殖', ko: '번식' });
        this.add('pet_hatch', { zhCN: '孵化', zhTW: '孵化', en: 'Hatch', ja: '孵化', ko: '부화' });
        this.add('pet_star', { zhCN: '星级', zhTW: '星級', en: 'Star', ja: '星', ko: '성급' });
        this.add('pet_attack', { zhCN: '攻击', zhTW: '攻擊', en: 'ATK', ja: '攻撃', ko: '공격' });
        this.add('pet_defense', { zhCN: '防御', zhTW: '防禦', en: 'DEF', ja: '防御', ko: '방어' });
        this.add('pet_hp', { zhCN: '生命', zhTW: '生命', en: 'HP', ja: 'HP', ko: 'HP' });
        this.add('pet_level', { zhCN: '等级', zhTW: '等級', en: 'Level', ja: 'レベル', ko: '레벨' });
        this.add('pet_skill', { zhCN: '技能', zhTW: '技能', en: 'Skill', ja: 'スキル', ko: '스킬' });

        // 元素
        this.add('element_fire', { zhCN: '火', zhTW: '火', en: 'Fire', ja: '炎', ko: '불' });
        this.add('element_water', { zhCN: '水', zhTW: '水', en: 'Water', ja: '水', ko: '물' });
        this.add('element_grass', { zhCN: '草', zhTW: '草', en: 'Grass', ja: '草', ko: '풀' });
        this.add('element_light', { zhCN: '光', zhTW: '光', en: 'Light', ja: '光', ko: '빛' });
        this.add('element_dark', { zhCN: '暗', zhTW: '暗', en: 'Dark', ja: '闇', ko: '어둠' });

        // PvP
        this.add('pvp_rank', { zhCN: '段位', zhTW: '段位', en: 'Rank', ja: 'ランク', ko: '랭크' });
        this.add('pvp_rating', { zhCN: '分数', zhTW: '分數', en: 'Rating', ja: 'レート', ko: '점수' });
        this.add('pvp_tier_bronze', { zhCN: '青铜', zhTW: '青銅', en: 'Bronze', ja: 'ブロンズ', ko: '브론즈' });
        this.add('pvp_tier_silver', { zhCN: '白银', zhTW: '白銀', en: 'Silver', ja: 'シルバー', ko: '실버' });
        this.add('pvp_tier_gold', { zhCN: '黄金', zhTW: '黃金', en: 'Gold', ja: 'ゴールド', ko: '골드' });
        this.add('pvp_tier_platinum', { zhCN: '铂金', zhTW: '鉑金', en: 'Platinum', ja: 'プラチナ', ko: '플래티넘' });
        this.add('pvp_tier_diamond', { zhCN: '钻石', zhTW: '鑽石', en: 'Diamond', ja: 'ダイヤモンド', ko: '다이아몬드' });
        this.add('pvp_tier_master', { zhCN: '大师', zhTW: '大師', en: 'Master', ja: 'マスター', ko: '마스터' });
        this.add('pvp_tier_grandmaster', { zhCN: '宗师', zhTW: '宗師', en: 'Grandmaster', ja: 'グランドマスター', ko: '그랜드마스터' });
        this.add('pvp_tier_legend', { zhCN: '传说', zhTW: '傳說', en: 'Legend', ja: 'レジェンド', ko: '레전드' });
        this.add('pvp_match', { zhCN: '开始匹配', zhTW: '開始匹配', en: 'Find Match', ja: 'マッチング', ko: '매칭 시작' });
        this.add('pvp_win', { zhCN: '你赢了!', zhTW: '你贏了!', en: 'You Win!', ja: '勝利!', ko: '승리!' });
        this.add('pvp_lose', { zhCN: '你输了', zhTW: '你輸了', en: 'You Lose', ja: '敗北', ko: '패배' });

        // 公会
        this.add('guild_create', { zhCN: '创建公会', zhTW: '創建公會', en: 'Create Guild', ja: 'ギルド作成', ko: '길드 생성' });
        this.add('guild_join', { zhCN: '加入公会', zhTW: '加入公會', en: 'Join Guild', ja: 'ギルド加入', ko: '길드 가입' });
        this.add('guild_war', { zhCN: '公会战', zhTW: '公會戰', en: 'Guild War', ja: 'ギルド戦', ko: '길드전' });
        this.add('guild_contribute', { zhCN: '捐献', zhTW: '捐獻', en: 'Donate', ja: '寄付', ko: '기부' });
        this.add('guild_shop', { zhCN: '公会商店', zhTW: '公會商店', en: 'Guild Shop', ja: 'ギルドショップ', ko: '길드 상점' });

        // 商店/充值
        this.add('shop_buy', { zhCN: '购买', zhTW: '購買', en: 'Buy', ja: '購入', ko: '구매' });
        this.add('shop_sale', { zhCN: '折扣', zhTW: '折扣', en: 'Sale', ja: 'セール', ko: '할인' });
        this.add('shop_hot', { zhCN: '热门', zhTW: '熱門', en: 'Hot', ja: '人気', ko: '인기' });
        this.add('shop_limited', { zhCN: '限时', zhTW: '限時', en: 'Limited', ja: '期間限定', ko: '기간 한정' });
        this.add('shop_first', { zhCN: '首充', zhTW: '首充', en: 'First Top-up', ja: '初回チャージ', ko: '첫충전' });
        this.add('shop_membership', { zhCN: '月卡会员', zhTW: '月卡會員', en: 'Monthly Pass', ja: '月額パス', ko: '월간 패스' });
        this.add('price_yuan', { zhCN: '¥', zhTW: 'NT$', en: '$', ja: '¥', ko: '₩' });

        // 邀请
        this.add('invite_title', { zhCN: '邀请好友', zhTW: '邀請好友', en: 'Invite Friends', ja: '友達を招待', ko: '친구 초대' });
        this.add('invite_code', { zhCN: '我的邀请码', zhTW: '我的邀請碼', en: 'My Referral Code', ja: '招待コード', ko: '내 초대 코드' });
        this.add('invite_reward', { zhCN: '邀请奖励', zhTW: '邀請獎勵', en: 'Referral Reward', ja: '招待報酬', ko: '초대 보상' });
        this.add('invite_share', { zhCN: '分享邀请', zhTW: '分享邀請', en: 'Share Invite', ja: '招待を共有', ko: '초대 공유' });

        // 提示
        this.add('tip_insufficient_gold', { zhCN: '金币不足', zhTW: '金幣不足', en: 'Not enough gold', ja: 'ゴールド不足', ko: '골드 부족' });
        this.add('tip_insufficient_gems', { zhCN: '钻石不足', zhTW: '鑽石不足', en: 'Not enough gems', ja: 'ジェム不足', ko: '보석 부족' });
        this.add('tip_insufficient_energy', { zhCN: '体力不足', zhTW: '體力不足', en: 'Not enough energy', ja: 'スタミナ不足', ko: '체력 부족' });
        this.add('tip_daily_limit', { zhCN: '今日次数已用完', zhTW: '今日次數已用完', en: 'Daily limit reached', ja: '本日の制限に達しました', ko: '일일 한도 도달' });
        this.add('tip_success', { zhCN: '操作成功', zhTW: '操作成功', en: 'Success!', ja: '成功!', ko: '성공!' });
        this.add('tip_fail', { zhCN: '操作失败', zhTW: '操作失敗', en: 'Failed', ja: '失敗', ko: '실패' });

        // 成就
        this.add('achieve_unlock', { zhCN: '达成成就', zhTW: '達成成就', en: 'Achievement Unlocked!', ja: '実績解除!', ko: '업적 달성!' });
        this.add('achievement_title', { zhCN: '成就系统', zhTW: '成就系統', en: 'Achievements', ja: '実績', ko: '업적' });

        // 签到
        this.add('sign_in', { zhCN: '签到', zhTW: '簽到', en: 'Sign In', ja: 'サインイン', ko: '출석' });
        this.add('sign_in_days', { zhCN: '已连续签到', zhTW: '已連續簽到', en: 'Consecutive days', ja: '連続サインイン', ko: '연속 출석' });
        this.add('sign_in_reward', { zhCN: '签到奖励', zhTW: '簽到獎勵', en: 'Sign-in Reward', ja: 'サインイン報酬', ko: '출석 보상' });
    }

    private add(key: string, translations: Partial<Record<keyof typeof Language, string>>): void {
        const map = new Map<Language, string>();
        const langMap: Record<string, Language> = {
            zhCN: Language.ZH_CN, zhTW: Language.ZH_TW,
            en: Language.EN, ja: Language.JA, ko: Language.KO
        };

        for (const [lang, text] of Object.entries(translations)) {
            const langKey = langMap[lang];
            if (langKey) map.set(langKey, text as string);
        }

        this.translations.set(key, map);
    }

    // ==================== 语言切换 ====================

    public setLanguage(lang: Language): void {
        this.currentLang = lang;
        GameConfig.saveLocal('language', lang);
        console.log(`[i18n] 语言切换至: ${lang}`);
    }

    public getLanguage(): Language {
        return this.currentLang;
    }

    private loadSavedLanguage(): void {
        const saved = GameConfig.loadLocal('language') as Language;
        if (saved && Object.values(Language).includes(saved)) {
            this.currentLang = saved;
        }
    }

    // ==================== 翻译API ====================

    /**
     * 获取翻译文本
     */
    public t(key: string, params?: Record<string, string | number>): string {
        const translations = this.translations.get(key);
        if (!translations) return key;

        let text = translations.get(this.currentLang)
            || translations.get(this.fallbackLang)
            || key;

        // 参数替换
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                text = text.replace(`{${k}}`, String(v));
            }
        }

        return text;
    }

    /**
     * 格式化数字（千分位）
     */
    public formatNumber(num: number): string {
        if (this.currentLang === Language.ZH_CN || this.currentLang === Language.ZH_TW) {
            if (num >= 10000) return (num / 10000).toFixed(1) + '万';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        }
        return num.toLocaleString(
            this.currentLang === Language.EN ? 'en-US' :
            this.currentLang === Language.JA ? 'ja-JP' :
            this.currentLang === Language.KO ? 'ko-KR' : 'zh-CN'
        );
    }

    /**
     * 格式化时间
     */
    public formatTime(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    }

    /**
     * 稀有度本地化
     */
    public getRarityText(rarity: string): string {
        return this.t(`pet_rarity_${rarity.toLowerCase()}`);
    }

    /**
     * 元素类型本地化
     */
    public getElementText(element: string): string {
        return this.t(`element_${element.toLowerCase()}`);
    }

    /**
     * 段位本地化
     */
    public getTierText(tier: string): string {
        return this.t(`pvp_tier_${tier.toLowerCase()}`);
    }

    // ==================== Getter ====================

    public getAvailableLanguages(): { code: Language; name: string; nativeName: string }[] {
        return [
            { code: Language.ZH_CN, name: '简体中文', nativeName: '简体中文' },
            { code: Language.ZH_TW, name: '繁體中文', nativeName: '繁體中文' },
            { code: Language.EN, name: 'English', nativeName: 'English' },
            { code: Language.JA, name: '日本語', nativeName: '日本語' },
            { code: Language.KO, name: '한국어', nativeName: '한국어' }
        ];
    }
}
