# 微信小游戏接入指南

## 🔧 准备工作

### 1. 注册微信小程序账号
1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 点击 "立即注册" → "小程序"
3. 填写邮箱、密码完成注册
4. 邮箱激活账号
5. 完成主体认证（个人/企业）

### 2. 获取AppID
1. 登录微信公众平台
2. 进入 "开发" → "开发管理"
3. 找到 AppID(小程序ID)
4. 记录下来，后续需要用到

### 3. 开通云开发
1. 进入 "云开发" 控制台
2. 点击 "开通"
3. 选择 "按量付费" 或 "包年包月"
4. 记录环境ID

---

## 📦 配置项目

### 1. 修改项目配置

**project.config.json**
```json
{
  "description": "萌宠大冒险",
  "packOptions": {
    "ignore": []
  },
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": false,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "enableEngineNative": false,
    "useIsolateContext": true,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "disableUseStrict": false,
    "minifyWXML": true,
    "showES6CompileOption": false,
    "useCompilerPlugins": false
  },
  "compileType": "game",
  "libVersion": "2.19.4",
  "appid": "你的AppID",
  "projectname": "mini-game-mengchong",
  "condition": {}
}
```

### 2. 修改云开发环境ID

**CloudManager.ts**
```typescript
// 替换为你的云开发环境ID
private envId: string = 'your-env-id';
```

---

## 🎮 微信SDK功能

### 已封装的功能

| 功能 | 文件 | 说明 |
|:---|:---|:---|
| 微信登录 | `WechatSDK.ts` | 获取用户信息 |
| 分享功能 | `WechatSDK.ts` | 主动分享、监听分享 |
| 激励视频 | `WechatSDK.ts` | 广告播放 |
| Banner广告 | `WechatSDK.ts` | 横幅广告 |
| 云开发 | `CloudManager.ts` | 数据库、存储、云函数 |
| 排行榜 | `CloudManager.ts` | 世界榜、好友榜 |
| 数据存储 | `CloudManager.ts` | 用户数据云端保存 |

### 使用方法

#### 1. 微信登录
```typescript
import { WechatSDK } from './managers/WechatSDK';

// 登录
async login() {
    try {
        await WechatSDK.instance.login();
        const userInfo = await WechatSDK.instance.getUserInfo();
        console.log('用户信息:', userInfo);
    } catch (err) {
        console.error('登录失败:', err);
    }
}
```

#### 2. 分享游戏
```typescript
// 主动分享
WechatSDK.instance.shareAppMessage(
    '我获得了SSR萌宠！快来一起玩！',
    'https://your-cdn.com/share.jpg',
    'score=10000'
);
```

#### 3. 播放广告
```typescript
// 播放激励视频
async showAd() {
    const completed = await WechatSDK.instance.showRewardedVideoAd(
        '你的广告单元ID'
    );
    
    if (completed) {
        // 发放奖励
        console.log('广告播放完成，发放奖励');
    }
}
```

#### 4. 保存数据到云端
```typescript
import { CloudManager } from './managers/CloudManager';

// 保存数据
async saveData() {
    const userData = {
        gold: 1000,
        diamonds: 100,
        pets: ['pet_001', 'pet_002']
    };
    
    const success = await CloudManager.instance.saveUserData(userData);
    if (success) {
        console.log('数据保存成功');
    }
}
```

#### 5. 获取排行榜
```typescript
// 获取世界排行榜
async getLeaderboard() {
    const list = await CloudManager.instance.getLeaderboard('endless', 100);
    console.log('排行榜:', list);
}

// 获取好友排行榜
async getFriendLeaderboard() {
    const list = await CloudManager.instance.getFriendLeaderboard('endless');
    console.log('好友榜:', list);
}
```

---

## ☁️ 云开发配置

### 1. 数据库集合

需要在云开发控制台创建以下集合：

| 集合名 | 说明 | 权限 |
|:---|:---|:---|
| `users` | 用户数据 | 仅创建者可读写 |
| `leaderboard` | 排行榜 | 所有用户可读 |
| `pets` | 萌宠配置 | 所有用户可读 |

### 2. 云函数

需要部署以下云函数：

**getOpenId**
```javascript
// cloudfunctions/getOpenId/index.js
const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext();
    return {
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
    };
};
```

**getFriendLeaderboard**
```javascript
// cloudfunctions/getFriendLeaderboard/index.js
const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event, context) => {
    const { mode } = event;
    const wxContext = cloud.getWXContext();
    
    // 获取好友关系链数据
    const friends = await cloud.getFriendCloudStorage({
        keyList: ['score']
    });
    
    // 排序并返回
    return {
        data: friends.data.sort((a, b) => b.score - a.score)
    };
};
```

### 3. 部署云函数
```bash
# 在微信开发者工具中
# 1. 右键 cloudfunctions/getOpenId
# 2. 选择 "创建并部署：云端安装依赖"
```

---

## 💰 广告接入

### 1. 申请广告位

1. 进入 [微信公众平台](https://mp.weixin.qq.com/)
2. 点击 "流量主" → "广告管理"
3. 创建广告位：
   - 激励视频广告
   - Banner广告
   - 插屏广告

### 2. 获取广告单元ID

创建后会获得类似这样的ID：
- 激励视频: `adunit-xxxxxxxxxxxxxxxx`
- Banner: `adunit-yyyyyyyyyyyyyyyy`

### 3. 在代码中使用

```typescript
// 激励视频
const REWARDED_AD_UNIT_ID = '你的激励视频广告单元ID';

// Banner
const BANNER_AD_UNIT_ID = '你的Banner广告单元ID';
```

---

## 💳 支付接入（可选）

### 1. 开通微信支付

1. 进入 "微信支付" 商户平台
2. 完成商户认证
3. 绑定小程序

### 2. 配置支付

```typescript
// 发起支付
wx.requestMidasPayment({
    mode: 'game',
    env: 0,
    offerId: '你的offerId',
    currencyType: 'CNY',
    platform: 'android',
    buyQuantity: 1,
    success: (res) => {
        console.log('支付成功', res);
    },
    fail: (err) => {
        console.error('支付失败', err);
    }
});
```

---

## 🚀 发布流程

### 1. 上传代码

1. 打开微信开发者工具
2. 点击 "上传"
3. 填写版本号、项目备注
4. 点击 "上传"

### 2. 提交审核

1. 登录微信公众平台
2. 进入 "版本管理"
3. 找到开发版本，点击 "提交审核"
4. 填写游戏基本信息
5. 上传游戏截图、宣传图
6. 提交审核

### 3. 审核通过

- 审核时间：1-7个工作日
- 审核通过后，点击 "发布"

---

## ⚠️ 注意事项

### 1. 合规要求
- 必须有用户协议和隐私政策
- 未成年人保护（防沉迷）
- 内容健康，无违规

### 2. 性能优化
- 首包大小不超过 4MB
- 总包大小不超过 20MB
- 加载时间不超过 5秒

### 3. 测试要求
- 真机测试通过
- 不同机型适配
- 网络环境测试

---

## 📚 相关链接

- [微信小游戏开发文档](https://developers.weixin.qq.com/minigame/dev/guide/)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [微信广告文档](https://ad.weixin.qq.com/guide/197)
- [Cocos Creator 微信小游戏发布](https://docs.cocos.com/creator/manual/zh/publish/publish-wechatgame.html)

---

**完成以上配置后，你的游戏就可以接入微信生态了！** 🎉