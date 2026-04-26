#!/bin/bash
# 微信小程序代码上传脚本

APPID="wx8e1435739bbdf94d"
KEY_PATH="../../keys/private.${APPID}.key"
VERSION="1.0.0"
DESCRIPTION="萌宠大冒险 - 首次发布"

echo "=========================================="
echo "萌宠大冒险 - 微信小程序上传"
echo "=========================================="
echo ""
echo "AppID: ${APPID}"
echo "版本: ${VERSION}"
echo ""

# 检查密钥文件
if [ ! -f "${KEY_PATH}" ]; then
    echo "❌ 错误: 找不到密钥文件 ${KEY_PATH}"
    exit 1
fi

echo "✅ 密钥文件存在"
echo ""

# 提示用户使用微信开发者工具上传
echo "请使用微信开发者工具上传代码:"
echo ""
echo "1. 打开微信开发者工具"
echo "2. 导入项目: $(pwd)"
echo "3. 点击 '上传' 按钮"
echo "4. 填写版本号: ${VERSION}"
echo "5. 填写项目备注: ${DESCRIPTION}"
echo ""
echo "或使用 miniprogram-ci 工具:"
echo "npx miniprogram-ci upload --appid ${APPID} --version ${VERSION} --desc '${DESCRIPTION}' --project-path $(pwd) --private-key-path ${KEY_PATH}"
echo ""
echo "=========================================="
