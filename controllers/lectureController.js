const { createBrowserFetcher } = require("puppeteer");
const lectureService = require("../services/lectureService");
const postService = require("../services/postService");

module.exports = {
    createReview: async (req, res) => {
        try {
            const userId = req.userId;
            const lectureId = req.query.lectureId;
            if (!lectureId) {
                res.status(404).send({
                    message: "cannot get lectureId.........",
                });
            }
            const post = req.body;
            console.log(post);
            if (!post) {
                res.status(404).send({ message: "cannot get body........" });
            }
            const { type, message, reviewId } =
                await lectureService.createReview(userId, lectureId, post);

            if (type === "Error") {
                return res.status(500).send({ type, message });
            }

            return res.status(200).json({ type, message, reviewId });
        } catch (err) {
            return res.status(500).json(err);
        }
    },

    getLecture: async (req, res) => {
        try {
            const lectureId = req.query.lectureId;
            if (!lectureId) {
                return res.status(400).json("잘못된 요청");
            }
            const lecture = await lectureService.findLectureById(lectureId);
            console.log("lecture", lecture);
            if (!lecture)
                return res.status(400).json("존재하지 않는 강의입니다.");
            return res.status(200).json({
                ok: true,
                message: "강의 정보 가져오기 성공!",
                data: lecture,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },

    getRecruitPosts: async (req, res) => {
        try {
            const lectureId = req.params.lectureId;
            console.log("lectureId", lectureId);
            console.log("query", req.query);
            const page = req.query.page ? req.query.page : 1;
            const sort = req.query.sort ? req.query.sort : "latest";

            const posts = await postService.findPostByLectureId(
                sort,
                page,
                lectureId,
                req.userId
            );
            return res.status(200).json({
                ok: true,
                message: "강의 포스트 가져오기 성공!",
                data: posts,
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
};
