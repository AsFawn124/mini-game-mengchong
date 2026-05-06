/**
 * 云函数：更新排行榜
 * 更新用户最高分
 */

const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext();
    const { score, wave } = event;
    
    try {
        // 查询用户历史最高分
        const userRecord = await db.collection('leaderboard')
            .where({
                openid: wxContext.OPENID
            })
            .orderBy('score', 'desc')
            .limit(1)
            .get();
        
        // 如果新分数更高，则更新
        if (userRecord.data.length === 0 || userRecord.data[0].score < score) {
            await db.collection('leaderboard').add({
                data: {
                    openid: wxContext.OPENID,
                    score: score,
                    wave: wave,
                    createTime: db.serverDate()
                }
            });
            
            return {
                success: true,
                message: '新纪录！',
                isNewRecord: true
            };
        }
        
        return {
            success: true,
            message: '分数已记录',
            isNewRecord: false
        };
        
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.message
        };
    }
};
