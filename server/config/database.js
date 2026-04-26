const mysql = require('mysql2/promise');

// 阿里云RDS MySQL配置
const dbConfig = {
    host: process.env.DB_HOST || 'your-rds-endpoint.mysql.rds.aliyuncs.com',
    user: process.env.DB_USER || 'your-db-username',
    password: process.env.DB_PASSWORD || 'your-db-password',
    database: process.env.DB_NAME || 'mengchong_game',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试连接
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('数据库连接成功');
        connection.release();
    } catch (error) {
        console.error('数据库连接失败:', error);
    }
}

// 初始化数据库表
async function initDatabase() {
    try {
        const connection = await pool.getConnection();
        
        // 用户表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                openid VARCHAR(100) UNIQUE NOT NULL,
                nickname VARCHAR(100),
                avatar VARCHAR(500),
                diamonds INT DEFAULT 300,
                gold INT DEFAULT 0,
                energy INT DEFAULT 50,
                best_score INT DEFAULT 0,
                best_wave INT DEFAULT 0,
                total_games INT DEFAULT 0,
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_openid (openid),
                INDEX idx_best_score (best_score)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        // 萌宠表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS user_pets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                openid VARCHAR(100) NOT NULL,
                pet_id VARCHAR(50) NOT NULL,
                level INT DEFAULT 1,
                exp INT DEFAULT 0,
                is_battle TINYINT DEFAULT 0,
                obtain_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_pet (openid, pet_id),
                FOREIGN KEY (openid) REFERENCES users(openid) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        // 排行榜表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INT AUTO_INCREMENT PRIMARY KEY,
                openid VARCHAR(100) NOT NULL,
                score INT NOT NULL,
                wave INT NOT NULL,
                game_data JSON,
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_score (score DESC),
                FOREIGN KEY (openid) REFERENCES users(openid) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        // 抽卡记录表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS gacha_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                openid VARCHAR(100) NOT NULL,
                pet_id VARCHAR(50) NOT NULL,
                rarity VARCHAR(10) NOT NULL,
                is_ten_draw TINYINT DEFAULT 0,
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (openid) REFERENCES users(openid) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        // 游戏日志表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS game_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                openid VARCHAR(100) NOT NULL,
                event VARCHAR(50) NOT NULL,
                data JSON,
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_openid_time (openid, create_time)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        connection.release();
        console.log('数据库表初始化完成');
    } catch (error) {
        console.error('数据库初始化失败:', error);
    }
}

module.exports = {
    pool,
    testConnection,
    initDatabase
};