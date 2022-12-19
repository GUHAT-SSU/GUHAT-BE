const lectureProjectService = require("../services/lectureProjectService");
const lectureService = require("../services/lectureService");
const postService = require("../services/postService");

module.exports = {
    createReview: async (req, res) => {
        try {
            const userId = req.userId;
            const lectureId = req.params.lectureId;
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
            console.log(err);
            return res.status(500).json(err);
        }
    },

    addReviewFile: async (req, res) => {
        try {
            const reviewId = req.query.reviewId;
            if (req.files) {
                await lectureService.uploadReviewFile(
                    reviewId,
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
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },

    postReviewValidation: async (req, res) => {
        try {
            const lectureId = req.params.lectureId;
            const canWrite = await lectureService.reviewPostValidation(
                req.userId,
                lectureId
            );
            if (canWrite.ok) {
                return res.status(200).json({
                    ...canWrite,
                });
            } else {
                return res.status(400).json({
                    ...canWrite,
                });
            }
        } catch (error) {
            console.log(err);
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
    getReviewAllPosts: async (req, res) => {
        try {
            const userId = req.userId;
            const lectureId = req.params.lectureId;
            let page = req.query.page;
            console.log("lectureId : ", lectureId);
            if (!lectureId) {
                return res.status(404).send({
                    message: "cannot get lectureId.........",
                });
            }
            const { lecture, reviewList } = await lectureService.findReviewAll(
                page,
                lectureId,
                userId
            );
            return res.status(200).json({
                ok: true,
                message: "해당과목 리뷰글 조회 성공!",
                lecture,
                reviewList,
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
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
    getReviewDetail: async (req, res) => {
        try {
            const lectureId = req.params.lectureId;
            const reviewId = req.params.reviewId;
            const review = await lectureService.findReviewDetail(
                req.userId,
                lectureId,
                reviewId
            );
            return res.status(200).json({
                ok: true,
                message: "리뷰글 상세 조회 성공!",
                data: review,
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },

    createReviewComment: async (req, res) => {
        try {
            const reviewId = req.params.reviewId;
            const like = req.body.like;
            const comment = req.body.comment;
            const result = await lectureService.createComment(
                req.userId,
                reviewId,
                like,
                comment
            );
            return res.status(200).json({
                ok: true,
                message: "리뷰글 댓글 작성 성공!",
                data: result,
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    getReviewComments: async (req, res) => {
        try {
            const lectureId = req.params.lectureId;
            const reviewId = req.params.reviewId;
            const lecture = await lectureService.findLectureById(lectureId);
            const result = await lectureService.findReviewCommentByReviewId(
                req.userId,
                reviewId
            );
            const canWrite = result.findIndex(
                (comment) => comment.liker_id === req.userId
            );
            console.log("canwrite", canWrite);

            return res.status(200).json({
                ok: true,
                message: "리뷰글 댓글 조회 성공!",
                data: {
                    canWrite: canWrite === -1,
                    lecture: lecture,
                    comments: result,
                },
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
};
