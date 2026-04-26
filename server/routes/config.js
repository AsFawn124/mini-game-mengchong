const express = require('express');
const router = express.Router();

// 获取游戏配置
router.get('/', (req, res) => {
    const config = {
        // 抽卡概率
        gachaRates: {
            N: { rate: 0.6, name: '普通' },
            R: { rate: 0.25, name: '稀有' },
            SR: { rate: 0.12, name: '超稀有' },
            SSR: { rate: 0.03, name: '传说' }
        },
        
        // 抽卡保底
        gachaPity: {
            SR: 30,   // 30抽保底SR
            SSR: 100  // 100抽保底SSR
        },
        
        // 抽卡价格
        gachaCost: {
            single: 100,
            ten: 900
        },
        
        // 体力系统
        energy: {
            max: 100,
            recoverTime: 300, // 5分钟恢复1点
            battleCost: 5
        },
        
        // 初始资源
        initialResources: {
            diamonds: 300,
            gold: 0,
            energy: 50
        },
        
        // 战斗配置
        battle: {
            maxTeamSize: 3,
            autoAttackInterval: 1.0,
            skillSelectInterval: 3
        },
        
        // 战令配置
        battlePass: {
            maxLevel: 50,
            expPerLevel: 1000
        },
        
        // 广告奖励
        adRewards: {
            energy: 10,
            diamond: 20,
            gold: 200
        },
        
        // 版本信息
        version: '1.0.0',
        maintenance: false
    };
    
    res.json({ success: true, config });
});

module.exports = router;