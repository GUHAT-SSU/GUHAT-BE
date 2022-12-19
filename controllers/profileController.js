const { ProfileFile, MemberReview } = require("../models");
const lectureProjectService = require("../services/lectureProjectService");
const profileService = require("../services/profileService");
const { delete_file } = require("../utils/s3");

module.exports = {
    /* ---- GET /profile/lecture/my 참여 이력 리스트 조회 ---- */
    getMyPost: async (req, res) => {
        try {
            // 쿼리스트링에서 유저 id 가져오기
            const writer_id = req.userId;
            let page = req.query.page;
            if (page == null) {
                page = 1;
            }
            console.log("writerId : " + writer_id);

            // postService로 보내기
            const data = await profileService.findMyPosts(writer_id, page);

            return res.status(200).json({
                ok: true,
                message: "참여 이력 조회 성공!",
                data: data ? data : [],
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    /* ---- GET /profile 참여 이력 리스트 조회 끝---- */

    /* --- GET /profile 프로필 조회 ---*/
    getProfile: async (req, res) => {
        try {
            const profile = await profileService.findProfileByUserId(
                req.userId
            );

            const teamHistoryResult = await lectureProjectService.getMyProjects(
                req.userId
            );

            const comments = await MemberReview.findAll({
                where: { receiver_id: req.userId },
                raw: false,
            });

            const teamHistory = teamHistoryResult.map((project) => {
                return {
                    projectId: project.project.id,
                    postId: project.id,
                    title: project.title,
                    lectureId: project.lecture_id,
                    startDate: project.project.createdAt,
                };
            });

            let file = [];
            if (profile) {
                file = await ProfileFile.findAll({
                    where: { user_id: req.userId },
                    raw: true,
                });
            }

            return res.status(200).json({
                ok: true,
                message: "유저 프로필 조회 성공",
                data: {
                    id: profile.id,
                    detail: profile.detail,
                    introduction: profile.introduction,
                    mode: profile.mode,
                    comments: comments ? comments : [],
                    skill: profile.skill ? JSON.parse(profile.skill) : [],
                    personality: profile.personality
                        ? JSON.parse(profile.personality)
                        : [0, 0, 0],
                    history: teamHistory ? teamHistory : [],
                    files: file ? file : [],
                },
            });
        } catch (err) {
            console.log(err);
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

        try {
            const profile = await profileService.findProfileByUserId(
                req.userId
            );
            if (!profile) {
                return res.status(400).json({ message: "프로필 조회 실패" });
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
        console.log(req.body);
        console.log(req.userId);
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
    /* ------ /profile/{profileId}/like --------- */
    createProfileLike: async (req, res) => {
        try {
            const isLike = req.body.isLike;
            const profileId = req.params.profileId;
            const message = await profileService.createProfileLike(
                req.userId,
                profileId,
                isLike
            );
            return res.status(200).json({
                ok: true,
                message: message,
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    getMyReview: async (req, res) => {
        try {
            const page = req.query.page;
            const data = await profileService.findMyReview(page, req.userId);
            return res.status(200).json({
                ok: true,
                message: "프로필 내가 작성한 리뷰 조회 성공!",
                data,
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    getMemberReview: async (req, res) => {
        try {
            const profileId = req.params.profileId;
            const { isOwner, reviewList } =
                await profileService.findMemberReview(req.userId, profileId);
            return res.status(200).json({
                ok: true,
                message: "팀원 리뷰 조회 성공!",
                isOwner,
                reviewList,
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
};
