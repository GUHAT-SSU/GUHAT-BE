const { Op } = require("sequelize");
const {
    LectureProject,
    LectureProjectMember,
    LecturePost,
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
};
