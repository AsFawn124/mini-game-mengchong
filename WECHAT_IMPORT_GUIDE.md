# 萌宠大冒险 - 微信开发者工具导入指南

## 🚨 重要：正确的导入方式

### 错误方式 ❌
不要直接导入项目根目录！

### 正确方式 ✅

#### 方法1：导入已构建的项目（推荐）

1. **先构建项目**
   ```bash
   # 使用 Cocos Creator 构建
   cocos build --platform wechatgame --buildPath build/wechatgame
   ```

2. **导入构建后的目录**
   - 微信开发者工具
   - 点击 "导入项目"
   - 选择 `build/wechatgame` 目录
   - AppID 填写：`wx8e1435739bbdf94d`

#### 方法2：开发调试模式

1. **创建开发目录结构**
   ```
   game-design-mengchong/
   ├── game.json          <-- 复制到根目录
   ├── project.config.json <-- 复制到根目录
   ├── assets/            <-- 游戏资源
   └── src/              <-- TypeScript源码（需编译）
   ```

2. **复制配置文件到根目录**
   ```bash
   cp build/wechatgame/game.json .
   cp build/wechatgame/project.config.json .
   ```

3. **导入项目根目录**
   - 微信开发者工具
   - 选择项目根目录
   - AppID：`wx8e1435739bbdf94d`

---

## 📁 项目结构说明

### 源码项目（开发）
```
game-design-mengchong/
├── assets/              # 游戏资源
│   ├── scripts/        # TypeScript 代码
│   ├── pets/           # 萌宠图片
│   └── ...
├── build/              # 构建输出
│   └── wechatgame/     # 微信小游戏构建目录
│       ├── game.json
│       └── project.config.json
└── docs/               # 文档
```

### 微信小游戏项目（运行）
```
build/wechatgame/
├── game.json           # 游戏配置
├── project.config.json # 项目配置
├── subpackages/        # 分包
├── assets/            # 资源文件
└── src/               # 编译后的 JS
```

---

## 🔧 快速修复

### 方案1：复制配置文件到根目录（临时）

```bash
cd /path/to/game-design-mengchong

# 复制配置文件到根目录
cp build/wechatgame/game.json .
cp build/wechatgame/project.config.json .

# 然后导入项目根目录
```

### 方案2：使用 Cocos Creator 构建

1. 打开 Cocos Creator
2. 打开项目
3. 菜单：项目 -> 构建发布
4. 发布平台：微信小游戏
5. 构建路径：`build/wechatgame`
6. 点击 "构建"
7. 用微信开发者工具导入 `build/wechatgame`

### 方案3：手动创建最小项目

在 `build/wechatgame` 目录下确保有以下文件：

**game.json**
```json
{
  "deviceOrientation": "portrait",
  "showStatusBar": false,
  "networkTimeout": {
    "request": 5000,
    "connectSocket": 5000,
    "uploadFile": 5000,
    "downloadFile": 5000
  },
  "cloud": true
}
```

**project.config.json**
```json
{
  "description": "萌宠大冒险",
  "setting": {
    "urlCheck": true,
    "es6": true,
    "postcss": true,
    "minified": true
  },
  "compileType": "game",
  "appid": "wx8e1435739bbdf94d",
  "projectname": "萌宠大冒险"
}
```

---

## ⚠️ 常见错误

### 错误1：未找到 game.json
**原因**：导入的目录不对
**解决**：导入 `build/wechatgame` 目录，而不是项目根目录

### 错误2：找不到 game.js
**原因**：没有构建项目
**解决**：先用 Cocos Creator 构建项目

### 错误3：资源加载失败
**原因**：路径问题
**解决**：确保构建完成，资源在正确位置

---

## ✅ 推荐流程

1. **安装 Cocos Creator 3.8.0**
2. **打开项目**
3. **构建项目**：项目 -> 构建发布 -> 微信小游戏
4. **导入微信开发者工具**：选择 `build/wechatgame` 目录
5. **预览调试**

---

**AppID**: wx8e1435739bbdf94d
**构建目录**: build/wechatgame
