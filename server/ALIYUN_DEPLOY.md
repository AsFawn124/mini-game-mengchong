# 萌宠大冒险 - 阿里云服务器部署指南

## 🚀 部署步骤

### 1. 购买阿里云服务器

1. 登录 [阿里云控制台](https://www.aliyun.com)
2. 购买 ECS 实例（推荐配置）：
   - **CPU**: 2核
   - **内存**: 4GB
   - **带宽**: 5Mbps
   - **系统**: CentOS 8 / Ubuntu 20.04

### 2. 购买阿里云RDS MySQL

1. 进入 RDS 控制台
2. 创建 MySQL 实例（推荐配置）：
   - **版本**: MySQL 8.0
   - **规格**: 2核4GB
   - **存储**: 100GB
3. 创建数据库 `mengchong_game`
4. 创建账号并授权
5. 记录连接地址、用户名、密码

### 3. 配置安全组

- 开放端口：
  - 80 (HTTP)
  - 443 (HTTPS)
  - 3000 (Node.js应用)
  - 3306 (MySQL，仅内网访问)

### 4. 服务器环境配置

```bash
# 连接服务器
ssh root@your-server-ip

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2
npm install -g pm2

# 安装Git
sudo apt-get install -y git

# 克隆代码
git clone https://github.com/AsFawn124/mini-game-mengchong.git
cd mini-game-mengchong/server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填写数据库连接信息

# 初始化数据库
node -e "const db = require('./config/database'); db.initDatabase();"

# 启动服务
pm2 start app.js --name mengchong-server

# 设置开机自启
pm2 startup
pm2 save
```

### 5. 配置Nginx反向代理

```bash
# 安装Nginx
sudo apt-get install -y nginx

# 编辑配置文件
sudo nano /etc/nginx/sites-available/mengchong
```

添加配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/mengchong /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. 配置HTTPS（推荐）

```bash
# 安装Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 申请SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 7. 更新前端代码

修改 `assets/scripts/managers/AliyunDBManager.ts`：

```typescript
private readonly SERVER_URL = 'https://your-domain.com/api';
```

### 8. 监控和日志

```bash
# 查看PM2日志
pm2 logs mengchong-server

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看MySQL慢查询日志
# 在RDS控制台配置
```

---

## 📊 数据库表结构

运行服务器后会自动创建以下表：

- `users` - 用户数据
- `user_pets` - 用户萌宠
- `leaderboard` - 排行榜
- `gacha_logs` - 抽卡记录
- `game_logs` - 游戏日志

---

## 🔧 常用命令

```bash
# 重启服务
pm2 restart mengchong-server

# 停止服务
pm2 stop mengchong-server

# 查看状态
pm2 status

# 更新代码
git pull
pm2 restart mengchong-server
```

---

## 💰 费用估算

| 服务 | 配置 | 月费用 |
|:---|:---|:---|
| ECS | 2核4GB | ~100元 |
| RDS | MySQL 2核4GB | ~200元 |
| 带宽 | 5Mbps | ~100元 |
| **总计** | | **~400元/月** |

---

## 📞 技术支持

- [阿里云文档](https://www.aliyun.com/product/ecs)
- [Node.js文档](https://nodejs.org/)
- [PM2文档](https://pm2.keymetrics.io/)

---

**部署日期**: 2026-04-26
**服务器IP**: [待填写]
**域名**: [待填写]
