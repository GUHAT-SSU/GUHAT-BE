const profileService = require('../services/profileService');

module.exports = {
    /* ---- GET '/profile/lecture/my?page={pageNum}' 작성한 구인글 상세조회 ---- */
    getMyPost: async(req,res) => {
        try {
            // 쿼리스트링에서 유저 id 가져오기
            const writer_id = req.userId;
            let page = req.query.page;
            if(page == null) {
                page = 1;
            }
            console.log("writerId : " + writer_id);
            // 쿼리스트링에서 sort 옵션 가져오기
            // const sort = req.query.sort;
            // console.log("sort : " + sort);
            // if((!sort == null) && !(sort === 'latest') && !(sort === 'popular')) {
            //    return  res.status(404).send({message: '그런 sort는 없습니다........'});
            // }

            // postService로 보내기
            const data = await profileService.findMyPosts(writer_id, page);

            return res.status(200).json({
                ok:true,
                message:"유저가 작성한 포스트 가져오기 성공!",
                data
            })
        } catch(err) {
            return res.status(500).json(err);
        }

    },
    /* ---- GET '/profile/lecture?writerId={userId}&sort={option}' 작성한 구인글 상세조회 끝---- */
}