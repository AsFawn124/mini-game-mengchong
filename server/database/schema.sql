-- 萌宠大冒险 - 数据库表结构
-- 阿里云 RDS MySQL 8.0

-- 创建数据库
CREATE DATABASE IF NOT EXISTS mengchong_game 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE mengchong_game;

-- ==================== 用户表 ====================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信OpenID',
    unionid VARCHAR(100) DEFAULT NULL COMMENT '微信UnionID',
    
    -- 基本信息
    nickname VARCHAR(100) DEFAULT '' COMMENT '昵称',
    avatar VARCHAR(500) DEFAULT '' COMMENT '头像URL',
    gender TINYINT DEFAULT 0 COMMENT '性别 0-未知 1-男 2-女',
    country VARCHAR(50) DEFAULT '' COMMENT '国家',
    province VARCHAR(50) DEFAULT '' COMMENT '省份',
    city VARCHAR(50) DEFAULT '' COMMENT '城市',
    
    -- 游戏资源
    diamonds INT DEFAULT 300 COMMENT '钻石',
    gold INT DEFAULT 0 COMMENT '金币',
    energy INT DEFAULT 50 COMMENT '体力',
    energy_last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '体力最后更新时间',
    
    -- 游戏数据
    level INT DEFAULT 1 COMMENT '玩家等级',
    exp INT DEFAULT 0 COMMENT '经验值',
    best_score INT DEFAULT 0 COMMENT '最高分',
    best_wave INT DEFAULT 0 COMMENT '最高波数',
    total_games INT DEFAULT 0 COMMENT '总游戏场次',
    total_wins INT DEFAULT 0 COMMENT '总胜利场次',
    
    -- 抽卡统计
    total_gacha INT DEFAULT 0 COMMENT '总抽卡次数',
    gacha_pity_sr INT DEFAULT 0 COMMENT 'SR保底计数',
    gacha_pity_ssr INT DEFAULT 0 COMMENT 'SSR保底计数',
    
    -- 战令数据
    battle_pass_level INT DEFAULT 1 COMMENT '战令等级',
    battle_pass_exp INT DEFAULT 0 COMMENT '战令经验',
    battle_pass_premium TINYINT DEFAULT 0 COMMENT '是否购买高级战令 0-否 1-是',
    battle_pass_claimed TEXT COMMENT '已领取的战令奖励(JSON数组)',
    
    -- 登录统计
    login_days INT DEFAULT 0 COMMENT '累计登录天数',
    last_login_date DATE DEFAULT NULL COMMENT '最后登录日期',
    consecutive_login_days INT DEFAULT 0 COMMENT '连续登录天数',
    
    -- 状态
    status TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-正常',
    is_online TINYINT DEFAULT 0 COMMENT '是否在线',
    
    -- 时间戳
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后登录时间',
    
    -- 索引
    INDEX idx_openid (openid),
    INDEX idx_best_score (best_score),
    INDEX idx_level (level),
    INDEX idx_create_time (create_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ==================== 用户萌宠表 ====================
CREATE TABLE IF NOT EXISTS user_pets (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    openid VARCHAR(100) NOT NULL COMMENT '用户OpenID',
    pet_id VARCHAR(50) NOT NULL COMMENT '萌宠ID',
    
    -- 萌宠数据
    level INT DEFAULT 1 COMMENT '等级',
    exp INT DEFAULT 0 COMMENT '经验值',
    star INT DEFAULT 0 COMMENT '星级',
    attack INT DEFAULT 0 COMMENT '攻击力',
    defense INT DEFAULT 0 COMMENT '防御力',
    hp INT DEFAULT 0 COMMENT '生命值',
    
    -- 状态
    is_battle TINYINT DEFAULT 0 COMMENT '是否出战 0-否 1-是',
    battle_position INT DEFAULT 0 COMMENT '出战位置',
    
    -- 时间
    obtain_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '获得时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 约束
    UNIQUE KEY unique_user_pet (openid, pet_id),
    FOREIGN KEY (openid) REFERENCES users(openid) ON DELETE CASCADE,
    INDEX idx_openid (openid),
    INDEX idx_pet_id (pet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户萌宠表';

-- ==================== 排行榜表 ====================
CREATE TABLE IF NOT EXISTS leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    openid VARCHAR(100) NOT NULL COMMENT '用户OpenID',
    
    -- 分数数据
    score INT NOT NULL COMMENT '分数',
    wave INT NOT NULL COMMENT '波数',
    game_time INT DEFAULT 0 COMMENT '游戏时长(秒)',
    game_data JSON DEFAULT NULL COMMENT '游戏详细数据',
    
    -- 时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    -- 索引
    INDEX idx_openid (openid),
    INDEX idx_score (score DESC),
    INDEX idx_create_time (create_time),
    FOREIGN KEY (openid) REFERENCES users(openid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排行榜表';

-- ==================== 抽卡记录表 ====================
CREATE TABLE IF NOT EXISTS gacha_logs (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    openid VARCHAR(100) NOT NULL COMMENT '用户OpenID',
    
    -- 抽卡数据
    pet_id VARCHAR(50) NOT NULL COMMENT '萌宠ID',
    rarity VARCHAR(10) NOT NULL COMMENT '稀有度 N/R/SR/SSR',
    is_new TINYINT DEFAULT 0 COMMENT '是否新获得 0-否 1-是',
    is_ten_draw TINYINT DEFAULT 0 COMMENT '是否十连抽 0-否 1-是',
    cost_diamonds INT DEFAULT 0 COMMENT '消耗钻石',
    
    -- 时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    -- 索引
    INDEX idx_openid (openid),
    INDEX idx_pet_id (pet_id),
    INDEX idx_rarity (rarity),
    INDEX idx_create_time (create_time),
    FOREIGN KEY (openid) REFERENCES users(openid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='抽卡记录表';

-- ==================== 商城订单表 ====================
CREATE TABLE IF NOT EXISTS shop_orders (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单编号',
    openid VARCHAR(100) NOT NULL COMMENT '用户OpenID',
    
    -- 商品信息
    item_id VARCHAR(50) NOT NULL COMMENT '商品ID',
    item_name VARCHAR(100) NOT NULL COMMENT '商品名称',
    item_type VARCHAR(20) NOT NULL COMMENT '商品类型',
    quantity INT DEFAULT 1 COMMENT '数量',
    price DECIMAL(10, 2) NOT NULL COMMENT '价格',
    currency VARCHAR(10) DEFAULT 'CNY' COMMENT '货币',
    
    -- 支付信息
    pay_type VARCHAR(20) DEFAULT 'wxpay' COMMENT '支付方式',
    pay_status TINYINT DEFAULT 0 COMMENT '支付状态 0-未支付 1-已支付 2-已退款',
    pay_time TIMESTAMP NULL DEFAULT NULL COMMENT '支付时间',
    transaction_id VARCHAR(100) DEFAULT NULL COMMENT '微信支付订单号',
    
    -- 时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 索引
    INDEX idx_order_no (order_no),
    INDEX idx_openid (openid),
    INDEX idx_pay_status (pay_status),
    INDEX idx_create_time (create_time),
    FOREIGN KEY (openid) REFERENCES users(openid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商城订单表';

-- ==================== 游戏日志表 ====================
CREATE TABLE IF NOT EXISTS game_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    openid VARCHAR(100) NOT NULL COMMENT '用户OpenID',
    
    -- 日志内容
    event VARCHAR(50) NOT NULL COMMENT '事件类型',
    event_data JSON DEFAULT NULL COMMENT '事件数据',
    ip VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    user_agent VARCHAR(500) DEFAULT NULL COMMENT 'User Agent',
    
    -- 时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    -- 索引
    INDEX idx_openid (openid),
    INDEX idx_event (event),
    INDEX idx_create_time (create_time),
    FOREIGN KEY (openid) REFERENCES users(openid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游戏日志表';

-- ==================== 成就表 ====================
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    openid VARCHAR(100) NOT NULL COMMENT '用户OpenID',
    
    -- 成就数据
    achievement_id VARCHAR(50) NOT NULL COMMENT '成就ID',
    progress INT DEFAULT 0 COMMENT '进度',
    is_completed TINYINT DEFAULT 0 COMMENT '是否完成 0-否 1-是',
    is_claimed TINYINT DEFAULT 0 COMMENT '是否领取奖励 0-否 1-是',
    
    -- 时间
    complete_time TIMESTAMP NULL DEFAULT NULL COMMENT '完成时间',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 约束
    UNIQUE KEY unique_user_achievement (openid, achievement_id),
    INDEX idx_openid (openid),
    INDEX idx_achievement_id (achievement_id),
    FOREIGN KEY (openid) REFERENCES users(openid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户成就表';

-- ==================== 每日任务表 ====================
CREATE TABLE IF NOT EXISTS user_daily_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    openid VARCHAR(100) NOT NULL COMMENT '用户OpenID',
    
    -- 任务数据
    task_id VARCHAR(50) NOT NULL COMMENT '任务ID',
    task_date DATE NOT NULL COMMENT '任务日期',
    progress INT DEFAULT 0 COMMENT '进度',
    is_completed TINYINT DEFAULT 0 COMMENT '是否完成 0-否 1-是',
    is_claimed TINYINT DEFAULT 0 COMMENT '是否领取奖励 0-否 1-是',
    
    -- 时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 约束
    UNIQUE KEY unique_user_task_date (openid, task_id, task_date),
    INDEX idx_openid (openid),
    INDEX idx_task_date (task_date),
    FOREIGN KEY (openid) REFERENCES users(openid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户每日任务表';

-- ==================== 好友关系表 ====================
CREATE TABLE IF NOT EXISTS user_friends (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    openid VARCHAR(100) NOT NULL COMMENT '用户OpenID',
    friend_openid VARCHAR(100) NOT NULL COMMENT '好友OpenID',
    
    -- 关系数据
    status TINYINT DEFAULT 1 COMMENT '状态 0-删除 1-正常 2-黑名单',
    can_send_energy TINYINT DEFAULT 1 COMMENT '能否赠送体力 0-否 1-是',
    last_interaction_time TIMESTAMP NULL DEFAULT NULL COMMENT '最后互动时间',
    
    -- 时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    -- 约束
    UNIQUE KEY unique_friend (openid, friend_openid),
    INDEX idx_openid (openid),
    INDEX idx_friend_openid (friend_openid),
    FOREIGN KEY (openid) REFERENCES users(openid) ON DELETE CASCADE,
    FOREIGN KEY (friend_openid) REFERENCES users(openid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='好友关系表';

-- ==================== 系统配置表 ====================
CREATE TABLE IF NOT EXISTS system_config (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    config_key VARCHAR(50) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值(JSON)',
    description VARCHAR(200) DEFAULT '' COMMENT '描述',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 插入默认配置
INSERT INTO system_config (config_key, config_value, description) VALUES
('gacha_rates', '{"N":0.6,"R":0.25,"SR":0.12,"SSR":0.03}', '抽卡概率'),
('gacha_pity', '{"SR":30,"SSR":100}', '抽卡保底'),
('gacha_cost', '{"single":100,"ten":900}', '抽卡价格'),
('energy_config', '{"max":100,"recoverTime":300}', '体力配置'),
('ad_rewards', '{"energy":10,"diamond":20,"gold":200}', '广告奖励'),
('maintenance', '{"enabled":false,"message":"系统维护中"}', '维护模式')
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);

-- 查看所有表
SHOW TABLES;