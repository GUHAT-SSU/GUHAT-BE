const { Op } = require("sequelize");
const {
    LectureProject,
    LectureProjectMember,
    LecturePost,
    Profile,
    MemberReview,
} = require("../models");

module.exports = {
    //TODO 테스트 필요
    getMyProjects: async (userId) => {
        try {
            const projects = await LectureProjectMember.findAll({
                where: {
                    member_id: userId,
                },

                raw: true,
            });
            console.log(projects.length);
            const history = [];
            for (let i = 0; i < projects.length; i++) {
                console.log(projects);
                const projectDetail = await LecturePost.findOne({
                    where: {
                        id: { [Op.col]: "LectureProject.lecturePost_id" },
                    },
                    include: [
                        {
                            model: LectureProject,
                            where: {
                                id: projects[i].lectureProject_id,
                            },

                            raw: true,
                        },
                    ],
                    require: false,
                });
                history.push({
                    ...projectDetail?.dataValues,
                    project: {
                        ...projectDetail?.dataValues?.LectureProject
                            ?.dataValues,
                    },
                });
            }
            return history;
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },
    createProject: async (postId, lectureId, writerId, member) => {
        try {
            const project = await LectureProject.create({
                lecturePost_id: postId,
                lecture_id: lectureId,
                user_id: writerId,
            });

            for (let i = 0; i < member.length; i++) {
                await LectureProjectMember.create({
                    lectureProject_id: project.id,
                    member_id: member[i],
                });
            }
            await LectureProjectMember.create({
                lectureProject_id: project.id,
                member_id: writerId,
            });
            await LecturePost.update(
                { status: "close" },
                {
                    where: {
                        id: postId,
                    },
                }
            );
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },
    createMemberReview: async(userId, lectureId, profileId, emojiType, score, comment) => {
        try {
            // user_id 가져오기
            const receiverId = await Profile.findOne({
                where: {id: profileId}
            }).then((res) => {return res.dataValues.user_id});
            if(receiverId === userId) return "Error";
            console.log(lectureId);
            // lectureId로 lectureProject_id 찾기
            const lectureProjectId = await LectureProject.findOne({
                where: {lecture_id: lectureId}
            }).then((res) => {return res.dataValues.id});
            // 멤버 리뷰 생성
            const memberReview = await MemberReview.create({
                score: score,
                comment: comment,
                emojiType: emojiType,
                writer_id: userId,
                lectureProject_id: lectureProjectId,
                receiver_id: receiverId
            });
            return memberReview;

        } catch(err) {
            console.log(err);
            return;
        }
    },
    
};
