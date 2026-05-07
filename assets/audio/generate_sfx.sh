#!/bin/bash
# 音效生成脚本 - 使用ffmpeg生成测试音效
# 实际项目中应替换为真实音效文件

echo "生成测试音效文件..."

# BGM (使用静音占位，时长符合要求)
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 120 -acodec libmp3lame -q:a 9 bgm_main.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 90 -acodec libmp3lame -q:a 9 bgm_battle.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 60 -acodec libmp3lame -q:a 9 bgm_gacha.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 30 -acodec libmp3lame -q:a 9 bgm_victory.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 30 -acodec libmp3lame -q:a 9 bgm_defeat.mp3 -y 2>/dev/null

# SFX (短音效)
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -acodec libmp3lame -q:a 9 sfx_click.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -acodec libmp3lame -q:a 9 sfx_popup.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.3 -acodec libmp3lame -q:a 9 sfx_close.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1.0 -acodec libmp3lame -q:a 9 sfx_merge.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1.5 -acodec libmp3lame -q:a 9 sfx_levelup.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 2.0 -acodec libmp3lame -q:a 9 sfx_gacha.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 2.0 -acodec libmp3lame -q:a 9 sfx_gacha_rare.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 3.0 -acodec libmp3lame -q:a 9 sfx_gacha_ssr.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -acodec libmp3lame -q:a 9 sfx_attack.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1.0 -acodec libmp3lame -q:a 9 sfx_skill_fire.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1.0 -acodec libmp3lame -q:a 9 sfx_skill_ice.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1.0 -acodec libmp3lame -q:a 9 sfx_skill_thunder.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -acodec libmp3lame -q:a 9 sfx_hit.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 2.0 -acodec libmp3lame -q:a 9 sfx_victory.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 2.0 -acodec libmp3lame -q:a 9 sfx_defeat.mp3 -y 2>/dev/null

echo "音效文件生成完成！"
echo "注意：这些是占位文件，请替换为真实音效"
ls -la *.mp3
