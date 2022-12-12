const profileService = require("../services/profileService");

module.exports = {
    /* ---- GET '/profile/lecture/my?page={pageNum}' 작성한 구인글 상세조회 ---- */
    getMyPost: async (req, res) => {
        try {
            // 쿼리스트링에서 유저 id 가져오기
            const writer_id = req.userId;
            let page = req.query.page;
            if (page == null) {
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
                ok: true,
                message: "유저가 작성한 포스트 가져오기 성공!",
                data,
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    /* ---- GET '/profile/lecture?writerId={userId}&sort={option}' 작성한 구인글 상세조회 끝---- */

    /* --- GET /profile 프로필 조회 ---*/
    getProfile: async (req, res) => {
        try {
            let profile = await profileService.findProfileByUserId(req.userId);

            if (!profile) {
                profile = await profileService.createProfile(req.userId); //최초 생성
            }

            //TODO 파일 추가
            return res.status(200).json({
                ok: true,
                message: "유저 프로필 조회 성공",
                data: {
                    id: profile.id,
                    detail: profile.detail,
                    introduction: profile.introduction,
                    mode: profile.mode,
                    skill: profile.skill,
                    personality: profile.personality,
                },
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },

    /* --- POST /profile/intro 프로필 소개란 작성 ---*/
    updateProfileIntro: async (req, res) => {
        const intro = req.body.introduction;
        const detail = req.body.detail;
        if (!intro | !detail) {
            return res.status(400).json({ message: "잘못된 요청" });
        }
        try {
            const profile = await profileService.findProfileByUserId(
                req.userId
            );
            if (!profile) {
                await profileService.createProfile(req.userId); //최초 생성
            }
            await profileService.updateProfileIntro(req.userId, intro, detail);

            return res.status(200).json({
                ok: true,
                message: "유저가 프로필 정보 수정 성공",
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },
};
