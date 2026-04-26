const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 用户登录/注册
router.post('/login', async (req, res) => {
    try {
        const { openid, nickname, avatar } = req.body;
        
        if (!openid) {
            return res.status(400).json({ success: false, message: '缺少openid' });
        }
        
        // 检查用户是否存在
        const [existingUsers] = await pool.execute(
            'SELECT * FROM users WHERE openid = ?',
            [openid]
        );
        
        if (existingUsers.length > 0) {
            // 更新用户信息
            await pool.execute(
                'UPDATE users SET nickname = ?, avatar = ? WHERE openid = ?',
                [nickname, avatar, openid]
            );
            
            const [updatedUsers] = await pool.execute(
                'SELECT * FROM users WHERE openid = ?',
                [openid]
            );
            
            return res.json({ success: true, user: updatedUsers[0], isNew: false });
        }
        
        // 创建新用户
        await pool.execute(
            'INSERT INTO users (openid, nickname, avatar) VALUES (?, ?, ?)',
            [openid, nickname, avatar]
        );
        
        const [newUsers] = await pool.execute(
            'SELECT * FROM users WHERE openid = ?',
            [openid]
        );
        
        res.json({ success: true, user: newUsers[0], isNew: true });
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 获取用户信息
router.get('/:openid', async (req, res) => {
    try {
        const { openid } = req.params;
        
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE openid = ?',
            [openid]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }
        
        // 获取用户的萌宠
        const [pets] = await pool.execute(
            'SELECT * FROM user_pets WHERE openid = ?',
            [openid]
        );
        
        const user = users[0];
        user.pets = pets;
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 更新用户数据
router.put('/:openid', async (req, res) => {
    try {
        const { openid } = req.params;
        const { diamonds, gold, energy, best_score, best_wave, total_games } = req.body;
        
        await pool.execute(
            `UPDATE users SET 
                diamonds = ?, 
                gold = ?, 
                energy = ?, 
                best_score = ?, 
                best_wave = ?, 
                total_games = ?
            WHERE openid = ?`,
            [diamonds, gold, energy, best_score, best_wave, total_games, openid]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('更新用户数据失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 添加萌宠
router.post('/:openid/pets', async (req, res) => {
    try {
        const { openid } = req.params;
        const { pet_id, level = 1, exp = 0 } = req.body;
        
        await pool.execute(
            'INSERT INTO user_pets (openid, pet_id, level, exp) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE level = ?',
            [openid, pet_id, level, exp, level]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('添加萌宠失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

module.exports = router;