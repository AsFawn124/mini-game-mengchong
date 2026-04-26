const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取排行榜
router.get('/', async (req, res) => {
    try {
        const { type = 'all', limit = 100 } = req.query;
        
        let query = `
            SELECT 
                u.openid,
                u.nickname,
                u.avatar,
                u.best_score as score,
                u.best_wave as wave,
                RANK() OVER (ORDER BY u.best_score DESC) as rank
            FROM users u
            WHERE u.best_score > 0
            ORDER BY u.best_score DESC
            LIMIT ?
        `;
        
        const [rows] = await pool.execute(query, [parseInt(limit)]);
        
        res.json({ success: true, leaderboard: rows });
    } catch (error) {
        console.error('获取排行榜失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 获取好友排行榜
router.get('/friends', async (req, res) => {
    try {
        const { openid } = req.query;
        
        // 这里需要接入微信好友关系链
        // 暂时返回全服排行榜作为示例
        const [rows] = await pool.execute(`
            SELECT 
                openid,
                nickname,
                avatar,
                best_score as score,
                best_wave as wave
            FROM users
            WHERE best_score > 0
            ORDER BY best_score DESC
            LIMIT 50
        `);
        
        res.json({ success: true, leaderboard: rows });
    } catch (error) {
        console.error('获取好友排行榜失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 获取用户排名
router.get('/rank/:openid', async (req, res) => {
    try {
        const { openid } = req.params;
        
        const [rows] = await pool.execute(`
            SELECT rank FROM (
                SELECT 
                    openid,
                    RANK() OVER (ORDER BY best_score DESC) as rank
                FROM users
                WHERE best_score > 0
            ) ranked
            WHERE openid = ?
        `, [openid]);
        
        if (rows.length === 0) {
            return res.json({ success: true, rank: -1 });
        }
        
        res.json({ success: true, rank: rows[0].rank });
    } catch (error) {
        console.error('获取用户排名失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

module.exports = router;