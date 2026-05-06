/**
 * 云函数：获取排行榜
 * 获取全服排行榜
 */

const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
    const { limit = 10 } = event;
    
    try {
        // 获取排行榜（按分数降序）
        const leaderboard = await db.collection('leaderboard')
            .orderBy('score', 'desc')
            .limit(limit)
            .get();
        
        // 获取用户信息
        const openids = leaderboard.data.map(item => item.openid);
        
        // 这里可以批量获取用户信息（如果有用户表）
        // 简化版直接返回
        
        return {
            success: true,
            data: leaderboard.data.map((item, index) => ({
                rank: index + 1,
                openid: item.openid,
                score: item.score,
                wave: item.wave,
                createTime: item.createTime
            }))
        };
        
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.message
        };
    }
};
