const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 提交分数
router.post('/submit', async (req, res) => {
    try {
        const { openid, score, wave, details } = req.body;
        
        if (!openid || score === undefined || wave === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少必要参数' 
            });
        }
        
        // 保存到排行榜
        await pool.execute(
            'INSERT INTO leaderboard (openid, score, wave, game_data) VALUES (?, ?, ?, ?)',
            [openid, score, wave, JSON.stringify(details || {})]
        );
        
        // 更新用户最佳成绩
        const [users] = await pool.execute(
            'SELECT best_score, best_wave FROM users WHERE openid = ?',
            [openid]
        );
        
        if (users.length > 0) {
            const currentBest = users[0].best_score;
            if (score > currentBest) {
                await pool.execute(
                    'UPDATE users SET best_score = ?, best_wave = ?, total_games = total_games + 1 WHERE openid = ?',
                    [score, wave, openid]
                );
            } else {
                await pool.execute(
                    'UPDATE users SET total_games = total_games + 1 WHERE openid = ?',
                    [openid]
                );
            }
        }
        
        res.json({ success: true, message: '分数提交成功' });
    } catch (error) {
        console.error('提交分数失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 获取用户历史记录
router.get('/history/:openid', async (req, res) => {
    try {
        const { openid } = req.params;
        const { limit = 20 } = req.query;
        
        const [rows] = await pool.execute(
            'SELECT * FROM leaderboard WHERE openid = ? ORDER BY create_time DESC LIMIT ?',
            [openid, parseInt(limit)]
        );
        
        res.json({ success: true, history: rows });
    } catch (error) {
        console.error('获取历史记录失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

module.exports = router;