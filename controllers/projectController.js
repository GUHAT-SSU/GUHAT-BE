const { LecturePost, Profile, LectureProject, MemberReview, ProfileFile, LectureProjectMember, User} = require("../models");
const lectureProjectService = require("../services/lectureProjectService");
const postService = require("../services/postService");
const profileService = require("../services/profileService");
const userService = require("../services/userService");

module.exports = {
    createProject: async (req, res) => {
        try {
            const postId = req.query.postId;
            const posting = await (
                await LecturePost.findByPk(postId)
            )?.dataValues;
            if (!posting) {
                return res.status(400).json({
                    message: "존재하지 않는 포스트입니다",
                });
            }
            if (posting.status === "close") {
                return res.status(400).json({
                    message: "이미 마감된 포스트입니다",
                });
            }
            const member = await postService.getMember(postId);
            if (member.length == 0) {
                return res.status(400).json({
                    message: "한명 이상의 팀원이 필요합니다",
                });
            }
            await lectureProjectService.createProject(
                postId,
                posting.lecture_id,
                posting.writer_id,
                member
            );
            return res.status(200).json({
                message: "프로젝트 생성 성공",
            });
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },
    createMemberReview: async (req, res) => {
        try {
            const lectureId = req.params.lectureId;
            const profileId = req.params.profileId;
            const emojiType = req.body.emojiType;
            const score = req.body.score;
            const comment = req.body.comment;
            const memberReview = await lectureProjectService.createMemberReview(
                req.userId,
                lectureId,
                profileId,
                emojiType,
                score,
                comment,
                
            );
            if(memberReview === "Error") { res.status(500).send("본인에게 리뷰를 남길 수 없다....")}
            return res.status(200).json({
                ok: true,
                message: "팀플 멤버 리뷰 남기기 성공!",
                memberReview: memberReview
            })

        } catch(err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    getOthersProfile: async (req, res) => {
        try {
            let comment_list = [];
            const profileId = req.params.profileId;
            const userId = req.userId;
            // 프로필 소유자의 id 찾기
            const ownerId = await Profile.findOne({
                where: { id: profileId }
            })
            .then((res) => {return res.dataValues.user_id});
            console.log("ownerId", ownerId);
            const profile = await profileService.findProfileByUserId(
                ownerId
            );
            if(userId === ownerId) return res.status(500).json({
                ok:false,
                message: "자신의 프로필을 조회하려고 함."
            });
            
            const teamHistoryResult = await lectureProjectService.getMyProjects(
                ownerId
            );

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
            if(profile) {
                file = await ProfileFile.findAll({
                    where: {user_id: ownerId },
                    raw: true,
                });
            }
            /* ------- canAccess ---------- */
            let canAccess = false;
            // 로그인된 유저가 참여한 project의 id 가져오기
            const userProjects = await LectureProjectMember.findAll({
                where: {member_id: userId}
            }).then((res) => {
                return res.map((value) => {
                    console.log("userProject Id: ", value.dataValues.lectureProject_id);
                    return value.dataValues.lectureProject_id
                })
            });
            console.log("userProjects ", userProjects);
            // 해당 프로필 owner가 참여한 project의 id 가져오기
            const ownerProjects = await LectureProjectMember.findAll({
                where: {member_id: ownerId}
            }).then((res) => {
                return res.map((value) => {
                    console.log("ownerProject Id: ", value.dataValues.lectureProject_id);
                    return value.dataValues.lectureProject_id
                })
            });
            console.log("ownerProjects ", ownerProjects);
            for(let i = 0; i < userProjects.length; i++) {
                for(let j = 0; j < ownerProjects.length; j++) {
                    if(userProjects[i] === ownerProjects[i]) {
                        canAccess = true;
                        break;
                    }
                }
            }  
            const writer = await userService.getUserInfo(ownerId);
            /* ------- canAccess ---------- */
            comment_list = await MemberReview.findAll({
                where: {receiver_id: ownerId},
                attributes: ["id", "score", "comment", "emojiType", "writer_id", "createdAt", "updatedAt"]
            }).then((res) => {
                return res.map((value) => value.dataValues)
            });
            return res.status(200).json({
                ok: true,
                message: "다른 사람 프로필 조회 성공",
                data: {
                    canAccess: canAccess,
                    nickname: writer.nickname,
                    profileImg: writer.profileImg,
                    id: profile.id,
                    detail: profile.detail,
                    introduction: profile.introduction,
                    mode: profile.mode,
                    skill: profile.skill ? JSON.parse(profile.skill) : [],
                    personality: profile.personality
                        ? JSON.parse(profile.personality)
                        : [0, 0, 0],
                    history: teamHistory ? teamHistory : [],
                    files: file ? file : [],
                    commentList: comment_list

                }
            })
            
        } catch(err) {
            console.log(err);
            return res.status(500).json(err);
        }
    }
};
