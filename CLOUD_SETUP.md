# 萌宠大冒险 - 微信云开发配置指南

## 📋 已配置信息

**小程序 AppID**: `wx8e1435739bbdf94d`

---

## 🚀 云开发配置步骤

### 1. 开通云开发

1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 进入你的小程序后台
3. 点击左侧菜单 "云开发"
4. 点击 "开通" 按钮
5. 选择 "免费版" 或按需求选择付费版本
6. 记录环境 ID（类似：`mengchong-xxx`）

### 2. 配置云开发环境ID

修改 `assets/scripts/managers/WechatSDK.ts` 中的环境ID：

```typescript
public static readonly CLOUD_ENV: string = '你的云开发环境ID';
```

### 3. 创建云函数

在云开发控制台中创建以下云函数：

#### 云函数：login
```javascript
// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};
```

#### 云函数：getUserData
```javascript
// cloudfunctions/getUserData/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  try {
    const result = await db.collection('users').doc(openid).get();
    return result.data;
  } catch (err) {
    // 用户不存在，创建新用户
    const newUser = {
      _id: openid,
      createTime: db.serverDate(),
      diamonds: 300,
      gold: 0,
      energy: 50,
      pets: [],
      bestScore: 0,
      bestWave: 0
    };
    await db.collection('users').add({ data: newUser });
    return newUser;
  }
};
```

#### 云函数：saveUserData
```javascript
// cloudfunctions/saveUserData/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { data } = event;
  
  try {
    await db.collection('users').doc(openid).update({
      data: {
        ...data,
        updateTime: db.serverDate()
      }
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};
```

#### 云函数：getRankList
```javascript
// cloudfunctions/getRankList/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { type = 'allTime' } = event;
  
  try {
    const result = await db.collection('users')
      .orderBy('bestScore', 'desc')
      .limit(100)
      .get();
    
    return result.data.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      nickname: user.nickname || '匿名玩家',
      avatar: user.avatar || '',
      score: user.bestScore || 0,
      wave: user.bestWave || 0,
      pets: user.pets ? user.pets.length : 0
    }));
  } catch (err) {
    return [];
  }
};
```

#### 云函数：submitScore
```javascript
// cloudfunctions/submitScore/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { score, wave } = event;
  
  try {
    const user = await db.collection('users').doc(openid).get();
    const currentBest = user.data.bestScore || 0;
    
    if (score > currentBest) {
      await db.collection('users').doc(openid).update({
        data: {
          bestScore: score,
          bestWave: wave,
          updateTime: db.serverDate()
        }
      });
    }
    
    return { success: true, isNewRecord: score > currentBest };
  } catch (err) {
    return { success: false, error: err };
  }
};
```

### 4. 创建数据库集合

在云开发控制台 - 数据库中创建以下集合：

- `users` - 用户数据
- `rank` - 排行榜数据
- `gacha_log` - 抽卡记录
- `shop_orders` - 商城订单

### 5. 配置广告单元ID

在微信小程序后台 - 流量主中：

1. 开通流量主功能
2. 创建广告位：
   - 激励视频广告
   - Banner广告
3. 复制广告单元ID到代码中：

```typescript
public static readonly AD_REWARDED: string = '你的激励视频广告单元ID';
public static readonly AD_BANNER: string = '你的Banner广告单元ID';
```

---

## 📱 发布前检查清单

- [ ] 云开发环境已开通
- [ ] 环境ID已配置到代码
- [ ] 云函数已部署
- [ ] 数据库集合已创建
- [ ] 广告单元已创建并配置
- [ ] 隐私协议已配置
- [ ] 用户授权说明已配置
- [ ] 游戏内容审核通过

---

## 🔗 相关链接

- [微信公众平台](https://mp.weixin.qq.com)
- [微信小游戏文档](https://developers.weixin.qq.com/minigame/dev/guide/)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

---

**配置日期**: 2026-04-26
**小程序ID**: wx8e1435739bbdf94d
