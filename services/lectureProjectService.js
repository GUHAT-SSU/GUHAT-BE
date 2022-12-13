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
            }).then((res) =>
                res.map((project) => project.dataValues.LectureProject_id)
            );
            const history = [];
            for (let i = 0; i < projects.length; i++) {
                const projectDetail = await LectureProject.findOne({
                    where: { lectureProject_id: projects[i] },
                    include: [
                        {
                            model: LecturePost,
                            required: false,
                        },
                    ],
                    raw: true,
                }).then((res) => res.dataValues);
                history.push(projectDetail);
            }
            return history;
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },
};
