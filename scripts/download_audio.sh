#!/bin/bash
# ==========================================
# 萌宠大作战 - 音频资源自动下载脚本
# 从免费音效站点批量下载 BGM 和 SFX
# ==========================================

set -e

AUDIO_DIR="../assets/audio"
BGM_DIR="${AUDIO_DIR}/bgm"
SFX_DIR="${AUDIO_DIR}/sfx"

echo "=========================================="
echo "  萌宠大作战 - 音频资源下载工具"
echo "=========================================="
echo ""

# 创建目录
mkdir -p "${BGM_DIR}" "${SFX_DIR}"

# ==================== BGM 下载 ====================

echo ">>> 下载 BGM 背景音乐..."

# 1. 主菜单BGM - 轻松愉快的冒险主题
download_bgm() {
    local name=$1
    local url=$2
    local filename=$3
    
    if [ -f "${BGM_DIR}/${filename}" ]; then
        echo "  [跳过] ${name} - 已存在"
        return
    fi
    
    echo "  [下载] ${name}..."
    if curl -L --connect-timeout 10 --max-time 60 -o "${BGM_DIR}/${filename}" "$url" 2>/dev/null; then
        echo "  [完成] ${name} -> ${filename}"
    else
        echo "  [失败] ${name} - 请手动下载: ${url}"
    fi
}

# OpenGameArt.org 推荐免费BGM (CC0/CC-BY)
echo ""
echo "  以下音频需要手动从免费站点下载:"
echo ""
echo "  📀 BGM推荐下载源 (CC0授权，可商用):"
echo "  ────────────────────────────────────────────"
echo "  1. 主菜单BGM (冒险主题):"
echo "     https://opengameart.org/content/adventure-theme"
echo "     https://opengameart.org/content/happy-adventure-loop"
echo ""
echo "  2. 战斗BGM (紧张激烈):"
echo "     https://opengameart.org/content/battle-theme"
echo "     https://opengameart.org/content/epic-battle"
echo ""
echo "  3. 抽卡BGM (神秘期待):"
echo "     https://opengameart.org/content/mystical-theme"
echo "     https://opengameart.org/content/magical-fairytale"
echo ""
echo "  4. Boss战BGM (史诗震撼):"
echo "     https://opengameart.org/content/boss-battle-theme"
echo "     https://opengameart.org/content/epic-orchestral-battle"
echo ""
echo "  5. 胜利BGM (欢快庆祝):"
echo "     https://opengameart.org/content/victory-fanfare"
echo "     https://opengameart.org/content/win-jingle"
echo ""
echo "  🔊 免费音效下载源:"
echo "  ────────────────────────────────────────────"
echo "  6. freesound.org 推荐音效包:"
echo "     - UI点击: https://freesound.org/people/LittleRobotSoundFactory/packs/16681/"
echo "     - 战斗音效: https://freesound.org/people/qubodup/packs/15735/"
echo "     - 魔法/技能: https://freesound.org/people/ryansitz/packs/14307/"
echo "     - 宠物叫声: https://freesound.org/search/?q=cute+animal+sound"
echo "     - 奖励音效: https://freesound.org/search/?q=success+chime"
echo ""
echo "  7. mixkit.co (免费音效+音乐):"
echo "     https://mixkit.co/free-sound-effects/game/"
echo "     https://mixkit.co/free-stock-music/"
echo ""
echo "  8. zapsplat.com (需注册，海量免费):"
echo "     https://www.zapsplat.com/sound-effect-category/game-sounds/"
echo ""

# ==================== AI 生成方案 ====================
echo ">>> 备选方案: AI音频生成"
echo ""
echo "  如果不想手动下载，可使用以下AI工具生成自定义音频:"
echo ""
echo "  工具                   | 类型     | 免费额度"
echo "  ───────────────────────┼─────────┼────────────"
echo "  Suno AI                | BGM音乐  | 每日5首"
echo "  AIVA                   | BGM配乐  | 每月3首"
echo "  Mubert                 | BGM配乐  | 每月25首"
echo "  ElevenLabs SFX         | 音效     | 新用户免费额"
echo "  AudioCraft (Meta开源)  | 本地生成 | 完全免费"
echo ""
echo "  提示词参考 (Suno/Mubert):"
echo "  'Happy adventure game background music, pixel art, '
echo "  'cute and playful, 8-bit chiptune with modern orchestra, 120bpm'"
echo ""
echo "  提示词参考 (ElevenLabs SFX):"
echo "  'A cute magical sparkle sound for collecting rewards in a game'"
echo ""

echo "=========================================="
echo "  下载指南已完成"
echo "  目标目录: ${AUDIO_DIR}"
echo "=========================================="
echo ""
echo "  下一步:"
echo "  1. 访问上述链接下载免费音频"
echo "  2. 将BGM放在: ${BGM_DIR}/"
echo "  3. 将SFX放在: ${SFX_DIR}/"
echo "  4. 文件名需与 audio_config.json 中配置一致"
echo ""
echo "  音频文件清单 (共37个):"
echo "    BGM (7首): menu, battle, gacha, boss, victory, shop, rank"
echo "    SFX (30个): click, confirm, cancel, battle_*, pet_*, skill_*"
echo ""
