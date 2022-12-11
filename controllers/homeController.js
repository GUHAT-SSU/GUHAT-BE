const homeService = require('../services/homeService');

module.exports = {
    getLecturePosts: async(req,res) => {
        try {
            const userId = req.userId;
            // homeService로 보내기
            const data = await homeService.findLecturePosts(userId);
            return res.status(200).json({
                ok:true,
                message:"홈화면 구인글 가져오기 성공!",
                data
            })
        } catch(err) {
            return res.status(500).json(err);
        }
    },
    getReviews : async (req, res) => {
        try {
            const userId = req.userId;
            const data = await homeService.findReviews(userId);
            return res.status(200).json({
                ok: true,
                message: "홈화면 리뷰글 가져오기 성공!",
                data
            })
        } catch(err) {
        return res.status(500).json(err);
        }
    }
}