const { LecturePost } = require("../models");
const lectureProjectService = require("../services/lectureProjectService");
const postService = require("../services/postService");

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
};
