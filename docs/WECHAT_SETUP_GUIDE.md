# 《萌宠大冒险》微信生态配置指南

**版本**: 1.0  
**日期**: 2026年5月9日  
**适用平台**: 微信小程序

---

## 1. 微信小程序注册

### 1.1 注册流程

1. **访问微信公众平台**
   - 网址: https://mp.weixin.qq.com/
   - 点击"立即注册"

2. **选择账号类型**
   - 选择"小程序"
   - 填写邮箱、密码、验证码

3. **邮箱激活**
   - 登录注册邮箱
   - 点击激活链接

4. **信息登记**
   - 选择主体类型: 个人/企业/政府/媒体/其他组织
   - 填写主体信息
   - 管理员信息验证

5. **等待审核**
   - 审核时间: 1-7个工作日
   - 审核通过后获得 AppID

### 1.2 小程序基本信息

```
小程序名称: 萌宠大冒险
小程序简称: 萌宠冒险
头像: (上传游戏Logo)
介绍: 治愈系萌宠收集养成游戏，合成进化，冒险战斗！
服务类目: 游戏 > 休闲游戏
```

### 1.3 获取 AppID

```
AppID: wx8e1435739bbdf94d (示例)
位置: 开发管理 > 开发设置 > AppID
```

---

## 2. 微信云开发配置

### 2.1 开通云开发

1. **进入云开发控制台**
   - 登录微信小程序后台
   - 点击"云开发"菜单
   - 点击"开通"

2. **选择环境**
   - 环境名称: mengchong-game
   - 建议创建两个环境:
     - 开发环境: mengchong-dev
     - 生产环境: mengchong-prod

3. **获取环境ID**
   ```
   环境ID: mengchong-game-xxx
   ```

### 2.2 数据库配置

#### 创建集合

```javascript
// 用户集合
users: {
  _openid: string,      // 用户OpenID
  nickname: string,     // 昵称
  avatar: string,       // 头像
  level: number,        // 等级
  exp: number,          // 经验
  coins: number,        // 金币
  diamonds: number,     // 钻石
  pets: array,          // 拥有的萌宠
  createdAt: date,      // 创建时间
  updatedAt: date       // 更新时间
}

// 排行榜集合
leaderboard: {
  _openid: string,      // 用户OpenID
  nickname: string,     // 昵称
  avatar: string,       // 头像
  score: number,        // 分数
  rank: number,         // 排名
  updatedAt: date       // 更新时间
}

// 好友集合
friends: {
  _openid: string,      // 用户OpenID
  friendOpenid: string, // 好友OpenID
  status: string,       // 状态: pending/accepted
  createdAt: date       // 创建时间
}
```

### 2.3 云函数部署

#### 云函数列表

```
cloudfunctions/
├── login/              # 用户登录
├── updateUser/         # 更新用户信息
├── getLeaderboard/     # 获取排行榜
├── updateLeaderboard/  # 更新排行榜
├── addFriend/          # 添加好友
├── getFriends/         # 获取好友列表
└── sendEnergy/         # 赠送体力
```

#### 部署命令

```bash
# 在微信开发者工具中
# 1. 右键 cloudfunctions/login 文件夹
# 2. 选择"创建并部署：云端安装依赖"
# 3. 等待部署完成
```

---

## 3. 广告配置

### 3.1 开通流量主

1. **申请条件**
   - 小程序累计独立访客(UV)不低于 1000
   - 无严重违规记录

2. **申请流程**
   - 登录小程序后台
   - 点击"流量主"菜单
   - 点击"申请开通"
   - 填写结算信息
   - 等待审核

### 3.2 创建广告单元

#### 激励视频广告

```
广告位名称: 激励视频-复活
广告位类型: 激励视频
广告单元ID: adunit-xxx (系统自动生成)
```

#### Banner广告

```
广告位名称: Banner-底部
广告位类型: Banner
广告单元ID: adunit-xxx
```

#### 插屏广告

```
广告位名称: 插屏-关卡结束
广告位类型: 插屏
广告单元ID: adunit-xxx
```

### 3.3 广告ID配置

```javascript
// GameConfig.ts
export const AD_CONFIG = {
  // 激励视频广告
  rewardedVideo: {
    adUnitId: 'adunit-xxx',
    // 使用场景: 复活、双倍奖励、免费抽卡
  },
  
  // Banner广告
  banner: {
    adUnitId: 'adunit-xxx',
    style: {
      left: 0,
      top: 0,
      width: 375
    }
  },
  
  // 插屏广告
  interstitial: {
    adUnitId: 'adunit-xxx'
  }
};
```

---

## 4. 支付配置

### 4.1 开通微信支付

1. **申请条件**
   - 企业主体小程序
   - 完成微信认证

2. **申请流程**
   - 登录小程序后台
   - 点击"微信支付"菜单
   - 选择"开通"
   - 填写商户信息
   - 提交审核

3. **获取商户号**
   ```
   商户号: 1234567890
   API密钥: xxxxxxxxxxxxxxxx
   ```

### 4.2 配置支付目录

```
支付授权目录: 
- https://xxx.weixin.qq.com/
- https://xxx.weixin.qq.com/pages/
```

### 4.3 商品配置

```javascript
// 商品列表
export const PRODUCTS = [
  {
    id: 'diamond_60',
    name: '60钻石',
    price: 6,
    description: '购买60钻石',
    icon: 'ui/icon_diamond_60.png'
  },
  {
    id: 'diamond_300',
    name: '300钻石',
    price: 30,
    description: '购买300钻石(送30)',
    bonus: 30,
    icon: 'ui/icon_diamond_300.png'
  },
  {
    id: 'diamond_680',
    name: '680钻石',
    price: 68,
    description: '购买680钻石(送100)',
    bonus: 100,
    icon: 'ui/icon_diamond_680.png'
  },
  {
    id: 'diamond_1280',
    name: '1280钻石',
    price: 128,
    description: '购买1280钻石(送280)',
    bonus: 280,
    icon: 'ui/icon_diamond_1280.png'
  },
  {
    id: 'diamond_3280',
    name: '3280钻石',
    price: 328,
    description: '购买3280钻石(送800)',
    bonus: 800,
    icon: 'ui/icon_diamond_3280.png'
  },
  {
    id: 'month_card',
    name: '月卡',
    price: 30,
    description: '每日领取100钻石，持续30天',
    icon: 'ui/icon_month_card.png'
  }
];
```

---

## 5. 法律文档

### 5.1 隐私政策

**文件位置**: `/docs/privacy_policy.html`

**主要内容**:
- 信息收集范围
- 信息使用目的
- 信息共享与披露
- 信息存储与保护
- 用户权利
- 未成年人保护
- 政策更新

### 5.2 用户协议

**文件位置**: `/docs/user_agreement.html`

**主要内容**:
- 服务条款
- 用户账号
- 用户行为规范
- 知识产权
- 免责声明
- 协议修改
- 法律适用

### 5.3 适龄提示

**文件位置**: `/docs/age_rating.html`

```
适龄提示: 12+
内容说明: 
- 本游戏涉及虚拟战斗，无血腥暴力内容
- 包含抽卡随机玩法
- 支持应用内购买
- 建议12岁以上用户在家长指导下使用
```

---

## 6. 服务器域名配置

### 6.1 request合法域名

```
https://xxx.tencentcloudapi.com
https://xxx.ap-shanghai.app.tcloudbase.com
```

### 6.2 socket合法域名

```
wss://xxx.tencentcloudapi.com
```

### 6.3 uploadFile合法域名

```
https://xxx.cos.ap-shanghai.myqcloud.com
```

### 6.4 downloadFile合法域名

```
https://xxx.cos.ap-shanghai.myqcloud.com
```

---

## 7. 用户隐私保护指引

### 7.1 配置隐私保护

1. **进入设置**
   - 小程序后台 > 设置 > 用户隐私保护指引

2. **填写内容**
   ```
   开发者处理的信息:
   - 昵称、头像 (用于显示用户信息)
   - 游戏数据 (用于保存游戏进度)
   - 好友关系 (用于社交功能)
   
   信息使用目的:
   - 提供游戏服务
   - 保存用户游戏进度
   - 实现好友互动功能
   ```

3. **更新隐私协议**
   - 上传隐私政策文档
   - 设置生效时间

---

## 8. 审核准备清单

### 8.1 基础信息

- [ ] 小程序名称已确定
- [ ] 小程序图标已上传
- [ ] 小程序介绍已填写
- [ ] 服务类目已选择
- [ ] 隐私政策已配置
- [ ] 用户协议已配置

### 8.2 功能测试

- [ ] 登录功能正常
- [ ] 游戏核心玩法正常
- [ ] 支付功能正常(如已开通)
- [ ] 分享功能正常
- [ ] 广告功能正常(如已开通)

### 8.3 内容检查

- [ ] 无违法违规内容
- [ ] 无侵权内容
- [ ] 无诱导分享
- [ ] 适龄提示已设置
- [ ] 虚拟货币说明已添加

### 8.4 性能优化

- [ ] 首屏加载时间 < 3秒
- [ ] 包大小 < 20MB
- [ ] 内存占用合理
- [ ] 无明显卡顿

---

## 9. 提交审核

### 9.1 提交步骤

1. **上传代码**
   - 微信开发者工具 > 上传
   - 填写版本号、项目备注

2. **提交审核**
   - 小程序后台 > 版本管理
   - 找到开发版本
   - 点击"提交审核"

3. **填写信息**
   - 功能页面: 首页路径
   - 功能描述: 简要描述游戏玩法
   - 测试账号: (如需要)
   - 测试密码: (如需要)
   - 备注: 其他需要说明的内容

4. **等待审核**
   - 审核时间: 1-7个工作日
   - 审核结果通知

### 9.2 审核常见问题

| 问题 | 解决方案 |
|:---|:---|
| 内容不完整 | 完善游戏功能，确保核心玩法可体验 |
| 体验不佳 | 优化UI交互，修复明显Bug |
| 诱导分享 | 移除强制分享，改为自愿分享 |
| 支付问题 | 确保支付流程完整，添加购买说明 |
| 隐私问题 | 完善隐私政策，明确信息使用范围 |

---

## 10. 上线后运营

### 10.1 数据分析

```
访问分析: 查看用户访问数据
用户画像: 了解用户群体特征
留存分析: 监控次日/7日/30日留存
转化分析: 分析付费转化漏斗
```

### 10.2 版本迭代

```
版本规划: 制定更新计划
用户反馈: 收集用户意见
Bug修复: 及时修复问题
新功能: 持续添加内容
```

---

**本指南为《萌宠大冒险》微信小程序上线配置的标准流程，请按步骤完成配置。**
