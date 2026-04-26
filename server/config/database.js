const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 阿里云RDS MySQL配置
const dbConfig = {
    host: process.env.DB_HOST || 'your-rds-endpoint.mysql.rds.aliyuncs.com',
    user: process.env.DB_USER || 'your-db-username',
    password: process.env.DB_PASSWORD || 'your-db-password',
    database: process.env.DB_NAME || 'mengchong_game',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试连接
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ 数据库连接成功');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        return false;
    }
}

// 初始化数据库表
async function initDatabase() {
    try {
        // 读取SQL文件
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        if (!fs.existsSync(schemaPath)) {
            console.log('⚠️ 未找到schema.sql文件，跳过初始化');
            return;
        }
        
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // 分割SQL语句
        const statements = schemaSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        const connection = await pool.getConnection();
        
        for (const statement of statements) {
            try {
                await connection.execute(statement);
            } catch (err) {
                // 忽略已存在的错误
                if (err.code !== 'ER_TABLE_EXISTS_ERROR' && 
                    err.code !== 'ER_DUP_ENTRY') {
                    console.error('执行SQL失败:', err.message);
                }
            }
        }
        
        connection.release();
        console.log('✅ 数据库表初始化完成');
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
    }
}

// 执行查询
async function query(sql, params) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('查询失败:', error);
        throw error;
    }
}

// 执行事务
async function transaction(callback) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    testConnection,
    initDatabase,
    query,
    transaction
};