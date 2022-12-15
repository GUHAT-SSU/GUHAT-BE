const {
    Lecture,
    LecturePost,
    User,
    LectureReviewFile,
    LectureReview,
} = require("../models");
const { Op, Error } = require("sequelize");
const bodyParser = require("body-parser");
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

    createReview: async (userId, lectureId, post) => {
        try {
            // TODO: 내가 수강한 과목인지, 한 번 리뷰를 쓴 적이 있는지 등 확인하는 로직 추가할 것입니당!
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
            const newReviewFile = await LectureReviewFile.create({
                review_id: newReview.id,
                lecture_id: lecture.id,
                price: post.reviewFile.price,
                file: post.reviewFile.file,
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
};
