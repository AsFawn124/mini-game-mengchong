#!/bin/bash
# 推送萌宠大冒险项目到 GitHub

echo "=========================================="
echo "萌宠大冒险 - GitHub 推送脚本"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

echo "当前提交状态："
git log -1 --oneline
echo ""

echo "推送到 GitHub..."
echo "提示：当要求输入密码时，请输入你的 GitHub Personal Access Token"
echo ""

git push origin master

echo ""
echo "=========================================="
if [ $? -eq 0 ]; then
    echo "✅ 推送成功！"
    echo "仓库地址：https://github.com/AsFawn124/mini-game-mengchong"
else
    echo "❌ 推送失败，请检查认证信息"
fi
echo "=========================================="
