const lectureProjectService = require("../services/lectureProjectService");
const profileService = require("../services/profileService");
const { delete_file } = require("../utils/s3");

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

            const teamHistory = await lectureProjectService.getMyProjects(
                req.userId
            );
            const file = profile.ProfileFiles.map((file) => file.dataValues);

            //TODO 파일 추가
            return res.status(200).json({
                ok: true,
                message: "유저 프로필 조회 성공",
                data: {
                    id: profile.id,
                    detail: profile.detail,
                    introduction: profile.introduction,
                    mode: profile.mode,
                    skill: JSON.parse(profile.skill),
                    personality: JSON.parse(profile.personality),
                    hisotry: teamHistory,
                    files: file,
                },
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },

    /* ---POST /profile 닉네임 & 이미지 수정  ---*/

    /* --- Patch /profile/mode 프로필 공개범위 변경 ---*/
    updateProfileMode: async (req, res) => {
        const mode = req.query.mode;
        if (!(mode == "public" || mode == "private")) {
            return res.status(400).json({ message: "잘못된 요청" });
        }
        try {
            //TODO 추후 profile 생성 유저 회원가입으로 이전
            const profile = await profileService.findProfileByUserId(
                req.userId
            );
            if (!profile) {
                await profileService.createProfile(req.userId); //최초 생성
            }
            await profileService.updateProfileMode(req.userId, mode);

            return res.status(200).json({
                ok: true,
                message: "유저가 프로필 공개범위 수정",
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },

    /* --- POST /profile/intro 프로필 소개란 작성 ---*/
    updateProfileIntro: async (req, res) => {
        const intro = req.body.introduction;
        const detail = req.body.detail;
        if (!intro || !detail) {
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

    /* s3 profile 폴더에 저장됨 파일 배열로 받음*/
    addProfileFile: async (req, res) => {
        if (req.files) {
            await profileService.addProfileFile(
                req.userId,
                req.files.map((file) => file.location)
            );
            return res.status(200).json({
                message: "upload 성공",
                data: req.files,
            });
        } else {
            return res.status(400).json({
                message: "upload 실패",
            });
        }
    },

    /* s3 profile 폴더에 접근해 삭제 */
    deleteProfileFile: async (req, res) => {
        //하나의 사진만 삭제합니다
        console.log(req.body);
        try {
            const file = req.body.file;
            if (!file)
                return res.status(400).json({
                    message: "잘못된 요청 값",
                });
            await profileService.deleteProfileFile(req.userId, file);
            delete_file(file);
            return res.status(200).json({
                message: "삭제 성공",
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },

    /* --- POST /profile/detail 프로필 스킬/성격/ 수정 ---*/
    updateProfileDetail: async (req, res) => {
        const skill = req.body.skill;
        const personality = req.body.personality;

        if (!skill | !personality) {
            return res.status(400).json({ message: "잘못된 요청" });
        }
        try {
            const profile = await profileService.findProfileByUserId(
                req.userId
            );
            if (!profile) {
                await profileService.createProfile(req.userId); //최초 생성
            }
            const result = await profileService.updateProfileDetail(
                req.userId,
                skill,
                personality
            );

            return res.status(200).json({
                ok: true,
                message: "유저가 프로필 정보 수정 성공",
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },
};
