const {
    Lecture,
    LecturePost,
    User,
    LectureReviewFile,
    LectureReview,
    LectureReviewLike,
} = require("../models");
const { Op, Error } = require("sequelize");
const bodyParser = require("body-parser");
const scheduleService = require("./scheduleService");
const userService = require("./userService");
module.exports = {
    findLecture: async (data, user) => {
        try {
            const title = data.title;
            const professor = data.professor;
            const day = data.day;
            const time = data.time;
            const place = data.place;
            const semester = data.semester;
            const year = data.year;
            const target = data.target ? data.target : null;
            const major = data.major;

            console.log(data);
            const result = await Lecture.findAll({
                where: {
                    [Op.and]: {
                        name: { [Op.like]: "%" + title + "%" },
                        semester: { [Op.like]: "%" + semester + "%" },
                        professor: { [Op.like]: "%" + professor + "%" },
                        year: year,
                        schedule: {
                            [Op.like]: "%" + time + "%",
                        },
                    },
                },
            }).then((res) => {
                return res.map((val, idx) => {
                    return val.dataValues;
                });
            });
            if (result.length > 1) {
                const filter = result.filter(
                    (lecture, i) => result.indexOf(lecture) === i
                );

                const lecture = [];
                filter.map((l, idx) => {
                    if (
                        l.schedule.includes(day) &&
                        (place ? l.schedule.includes(place) : true) &&
                        (l.target
                            ? l.target.includes(major) &&
                              l.target.includes(user.grade)
                            : false)
                    )
                        lecture.push(l);
                });
                return lecture;
            } else return result;
        } catch (err) {
            console.log(err);
            return;
        }
    },
    findReviewAll: async (page, lectureId, userId) => {
        try {
            // pagination
            let limit = 10;
            let offset = 0;
            if (page > 1) {
                offset = limit * (page - 1);
            }
            // 해당 과목 리뷰글 모두 가져오기
            const reviews = await LectureReview.findAll({
                where: { lecture_id: lectureId },
            }).then((res) => {
                return res.map((res) => {
                    return {
                        ...res.dataValues,
                        // 작성자인지 보여주기
                        isOwner: res.dataValues.writer_id === userId,
                    };
                });
            });
            const lecture = await Lecture.findOne({
                where: { id: lectureId },
            }).then((val) => {
                if (val)
                    return {
                        ...val.dataValues,
                        schedule: JSON.parse(val.dataValues.schedule),
                        professor: JSON.parse(val.dataValues.professor),
                        target: JSON.parse(val.dataValues.target),
                    };
            });

            const reviewList = [];

            for (let r = 0; r < reviews.length; r++) {
                const review = reviews[r];
                // 작성자 정보 불러오기
                const writer = await User.findByPk(review.writer_id);
                // 파일 수 세기
                let fileCnt = 0;
                const files = await LectureReviewFile.findAll({
                    where: { review_id: review.id },
                });
                files.forEach((file) => {
                    fileCnt++;
                });
                // 좋아요 수 세기
                let likeCnt = 0;
                const likes = await LectureReviewLike.findAll({
                    where: { review_id: review.id },
                });
                likes.forEach((like) => {
                    if (like.status === "like") {
                        likeCnt++;
                    }
                });
                reviewList.push({
                    id: review.id,
                    title: review.title,
                    reviewLevel: review.level,
                    memeberNum: review.memberNum,
                    fileCnt: fileCnt,
                    detail: review.detail,
                    nickname: writer.nickname,
                    writerLevel: writer.level,
                    viewCnt: review.viewCnt,
                    likeCnt: likeCnt,
                    createdAt: review.createdAt,
                    isOwner: review.isOwner,
                });
            }
            return { lecture, reviewList };
        } catch (err) {
            console.log(err);
            return;
        }
    },
    findLectureByName: async (name) => {
        try {
            const result = await Lecture.findAll({
                where: {
                    name: { [Op.like]: "%" + name + "%" },
                },
            }).then((res) => {
                return res.map((val, idx) => {
                    return {
                        ...val.dataValues,
                        schedule: JSON.parse(val.dataValues.schedule),
                        professor: JSON.parse(val.dataValues.professor),
                        target: JSON.parse(val.dataValues.target),
                    };
                });
            });
            return result.filter((lecture, i) => result.indexOf(lecture) === i); //중복제거
        } catch (err) {
            console.log(err);
            return;
        }
    },

    findLectureById: async (lectureId) => {
        try {
            return await Lecture.findByPk(lectureId).then((res) => {
                if (res)
                    return {
                        ...res.dataValues,
                        professor: JSON.parse(res.dataValues.professor),
                        schedule: JSON.parse(res.dataValues.schedule),
                    };
                else return res;
            });
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },

    findLectureByProfessor: async (professor) => {
        try {
            const result = await Lecture.findAll({
                where: {
                    professor: { [Op.like]: "%" + professor + "%" },
                },
            }).then((res) => {
                return res.map((val, idx) => {
                    return {
                        ...val.dataValues,
                        schedule: JSON.parse(val.dataValues.schedule),
                        professor: JSON.parse(val.dataValues.professor),
                        target: JSON.parse(val.dataValues.target),
                    };
                });
            });
            return result.filter((lecture, i) => result.indexOf(lecture) === i);
        } catch (err) {
            console.log(err);
            return;
        }
    },

    reviewPostValidation: async (userId, lectureId) => {
        try {
            const schedule = await scheduleService.findScheduleByUserId(userId);

            if (schedule.length == 0)
                return { ok: false, message: "시간표 업로드가 필요합니다" };

            let validation = schedule
                .map((s) => s.dataValues)
                .findIndex((s) => {
                    return s.lecture_id == lectureId;
                });

            if (validation !== -1) {
                return { ok: true, message: "리뷰 작성 가능합니다" };
            }
            return { ok: false, message: "수강 과목이 아닙니다" };
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    },

    createReview: async (userId, lectureId, post) => {
        try {
            const lecture = await Lecture.findByPk(lectureId);
            const writer = await User.findByPk(userId);
            const newReview = await LectureReview.create({
                title: post.title,
                memberNum: post.peopleNum,
                level: post.level,
                period: post.period,
                topic: post.topic,
                detail: post.detail,
                writer_id: writer.id,
                lecture_id: lectureId,
            });

            return {
                type: "Success",
                message: "You successfully created a new review!",
                reviewId: newReview.id,
            };
        } catch (err) {
            if (
                err.toString() ==
                "SequelizeForeignKeyConstraintError: Cannot add or update a child row: a foreign key constraint fails (`dev`.`lectureReviews`, CONSTRAINT `lectureReviews_ibfk_2` FOREIGN KEY (`lecture_id`) REFERENCES `schedules` (`lecture_id`) ON DELETE SET NULL ON UPDATE CASCADE)"
            ) {
                return {
                    type: "Error",
                    message: "당신의 과목이 아닙니다....",
                };
            }
            console.log(err);
            return {
                type: "Error",
                message: err.toString(),
            };
        }
    },

    uploadReviewFile: async (reviewPostId, files) => {
        try {
            const post = await LectureReview.findByPk(reviewPostId);
            if (!post) return;
            for (let i = 0; i < files.length; i++) {
                const newReviewFile = await LectureReviewFile.create({
                    review_id: post.id,
                    lecture_id: post.dataValues.lecture_id,
                    price: 0,
                    file: files[i],
                });
            }
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    },
    findReviewDetail: async (userId, lectureId, reviewId) => {
        try {
            // 해당 리뷰 가져오기
            const review = await LectureReview.findOne({
                where: { id: reviewId },
                include: [
                    {
                        model: LectureReviewFile,
                        required: false,
                        where: { review_id: reviewId },
                    },
                ],
            }).then((res) => {
                return {
                    ...res.dataValues,
                    isOwner: res.dataValues.writer_id === userId,
                };
            });

            console.log(review);
            // writer 정보 가져오기
            const writer = await userService.getUserInfo(review.writer_id);

            const lecture = await Lecture.findOne({
                where: { id: lectureId },
            });

            return {
                isOwner: review.isOwner,
                title: review.title,
                year: lecture.year,
                semester: lecture.semester,
                createdAt: review.createdAt,
                writerId: writer.id,
                nickname: writer.nickname,
                writerLevel: writer.level,
                profileImg: writer.profileImg,
                memberNum: review.memberNum,
                startDate: `${review.period[0]}월`,
                endDate: `${review.period[1]}월`,
                reviewLevel: review.level,
                subject: review.topic,
                detail: review.detail,
                files: review.LectureReviewFiles
                    ? review.LectureReviewFiles.map((f) => f.dataValues.file)
                    : [],
            };
        } catch (err) {
            console.log(err);
            return;
        }
    },
    createComment: async (userId, reviewId, like, comment) => {
        try {
            const review = await LectureReview.findByPk(reviewId);
            await review.createLectureReviewLike({
                status: like,
                comment: comment,
                review_id: reviewId,
                liker_id: userId,
                lecture_id: review.lecture_id,
            });
        } catch (err) {
            console.log(err);
            return;
        }
    },
    findReviewCommentByReviewId: async (userId, reviewId) => {
        try {
            return await LectureReviewLike.findAll({
                where: {
                    review_id: reviewId,
                },
                raw: true,
            });
        } catch (err) {
            console.log(err);
            return;
        }
    },
};
