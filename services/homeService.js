const { ConsoleMessage } = require("puppeteer");
const { Op } = require("sequelize");
const {
    LecturePost,
    Lecture,
    User,
    Role,
    RoleApplier,
    UserProfileImg,
    ProfileFile,
    LectureProject,
    MemberReview,
    LectureReview,
    LectureReviewLike,
    LectureProjectMember,
} = require("../models");
const { findOne } = require("../models/user");
const { myFindMajor, mySort } = require("../utils/myFunction");
const userService = require("./userService");

module.exports = {
    getUserInfo: async (userId) => {
        try {
            const user = await User.findOne({
                where: { id: userId },
            });
            const data_list = [];
            const profileImg = await UserProfileImg.findOne({
                where: {
                    user_id: userId,
                },
            });
            // lectureProject 에서 유저가 가지고 있는 lectureProject 모두 count
            let currentProject = 0;
            const lectureProject = await LectureProjectMember.findAll({
                where: {
                    member_id: userId,
                },
            });
            lectureProject.forEach((project) => {
                currentProject++;
            });
            let total = 0;
            let count = 0;
            const reviewScore = await MemberReview.findAll({
                where: {
                    receiver_id: userId,
                },
                attributes: ["score"],
                raw: true,
            }).then((lectureScore) => {
                console.log("lectureScore", lectureScore);
                lectureScore.forEach((score) => {
                    count++;
                    total += score.score;
                });
                return total / count;
            });
            console.log("reviewScore", reviewScore);
            const data = {
                ...user.dataValues,
                profileImg: profileImg.file ? profileImg.file : null,
                currentProject,
                reviewScore,
            };

            delete data.token;
            delete data.password;
            console.log("user", data);
            return data;
        } catch (error) {
            console.log(error);
        }
    },
    findLecturePosts: async (userId) => {
        try {
            let major;
            let limit = 10;
            /*
             * LecturePost 에서 가져와야 하는 것 : lecture_id, writer_id, endDate, title, detail, viewCnt
             * Lecture 에서 가져와야 하는 것: name, professor, semester, schedule, major(null여부) => json.stringify()로 해당 key 값만 넘겨주면 될듯.
             * User에서 가져와야하는 것 : id, name, nickname, level
             * UserProfileImg에서 가져와야 하는 것 : (user_id로 찾기) file
             * RoleApplier에서 가져와야 하는 것 : (lecturePost_id로 찾기)
             * id 세기 -> 곧 해당 게시물의 total 지원자 수
             * status 가 success 인 id 세기 -> 곧 해당 게시물의 current 를 뜻함.
             */

            // 유저가 작성한 구인글 모두 가져오기
            /** 효민 : 유저가 작성하지 않은 것도 보여줘야함 **/
            /** 효민 : 데이터 처리 속도가 느림 최적화 필요 **/
            const lecturePosts = await LecturePost.findAll({
                // where: {
                //     writer_id: userId,
                // },
                limit: limit,
                order: [["createdAt", "DESC"]], // 최신순
            }).then((res) => {
                return res.map((res) => {
                    return {
                        ...res.dataValues,
                        isOwner: res.dataValues.writer_id === userId,
                    };
                });
            });

            const data_list = [];
            console.log(lecturePosts);

            for (let l = 0; l < lecturePosts.length; l++) {
                // lecturePost의 lecture_id로 Lecture에서 해당 과목 찾기
                const lecturePost = lecturePosts[l];

                const lecture = await Lecture.findOne({
                    where: {
                        id: lecturePost.lecture_id,
                    },
                }).then((result) => {
                    return result.dataValues;
                });

                major = await myFindMajor(lecture);

                // 유저 찾아서 프로필 이미지 가져오기
                const writer = await User.findOne({
                    where: { id: lecturePost.writer_id },
                    include: [
                        {
                            model: UserProfileImg,
                            require: false,
                            where: { user_id: lecturePost.writer_id },
                        },
                    ],
                });
                console.log("writer!!!! : " + writer);

                // const profileImg = await UserProfileImg.findOne({
                //     where: {
                //         user_id: userId,
                //     },
                // });
                // console.log("profileImg : " + profileImg.id);

                // total : 해당 포스트의 총 지원자 수
                // current : status == "success"인 사람
                /*
                const total = await RoleApplier.findAndCountAll({
                    where: {
                        lecturePost_id: lecturePost.id,
                    },
                    distinct: true, // 연결된 테이블로 인해 count가 바뀌는 현상을 막을 수 있다
                }).then((result) => {
                    return result.count;
                });
                console.log("total : " + total);

                const current = await RoleApplier.findAndCountAll({
                    where: {
                        lecturePost_id: lecturePost.id,
                        status: "success",
                    },
                    distinct: true, // 연결된 테이블로 인해 count가 바뀌는 현상을 막을 수 있다
                }).then((result) => {
                    return result.count;
                });*/
                const list = await Role.findAll({
                    where: { lecturePost_id: lecturePost.id },
                    include: [
                        {
                            model: RoleApplier,
                            required: false,
                            where: {
                                group_id: {
                                    [Op.col]: "Role.id",
                                },
                            },
                        },
                    ],
                }).then((res) => res.map((value) => value.dataValues));

                let total = 0;
                let current = 0;
                list.forEach((role) => {
                    total += role.max;
                    role.RoleAppliers.forEach((mem) => {
                        if (mem.status === "success") current++;
                    });
                });
                // const current = applier.filter(
                //     (item) => item.status === "success"
                // ).length;
                console.log("current : " + current);
                // data_list 정리
                data_list.push({
                    id: lecturePost.id,
                    lecture: {
                        lectureId: lecture.id,
                        name: lecture.name,
                        professors: JSON.parse(lecture.professor),
                        semester: lecture.semester,
                        schedule: JSON.parse(lecture.schedule),
                    },
                    type: major,
                    isOwner: lecturePost.isOwner,
                    writer: {
                        studentId: writer.id,
                        name: writer.name,
                        nickname: writer.nickname,
                        level: writer.level,
                        profileImg: writer.UserProfileImg.file,
                    },
                    endDate: lecturePost.endDate,
                    title: lecturePost.title,
                    detail: lecturePost.detail,
                    viewCount: lecturePost.viewCnt,
                    total: total,
                    current: current,
                });
            }
            return data_list;
        } catch (err) {
            console.log(err);
            throw Error(err);
        }
    },
    findReviews: async (userId) => {
        try {
            let limit = 10;
            const reviews = await LectureReview.findAll({
                limit: limit,
                order: [["createdAt", "DESC"]],
            }).then((res) => {
                return res.map((res) => {
                    return {
                        ...res.dataValues,
                        isOwner: res.dataValues.writer_id === userId,
                    };
                });
            });

            const data_list = [];
            console.log(reviews);
            // lecture 정보, wirter, title, detail. likeCOujt
            for (let r = 0; r < reviews.length; r++) {
                const review = reviews[r];
                const lecture = await Lecture.findOne({
                    where: {
                        id: review.lecture_id,
                    },
                }).then((result) => {
                    return result.dataValues;
                });
                const writer = await User.findOne({
                    where: { id: review.writer_id },
                    include: [
                        {
                            model: UserProfileImg,
                            required: false,
                            where: { user_id: review.writer_id },
                        },
                    ],
                });
                // likeCount 세기
                let likeCount = 0;
                const likes = await LectureReviewLike.findAll({
                    where: { review_id: review.id },
                }).then((res) => res.map((value) => value.dataValues));
                likes.forEach((like) => {
                    if (like.status === "like") likeCount++;
                });
                data_list.push({
                    id: review.id,
                    lecture: {
                        lectureId: lecture.id,
                        name: lecture.name,
                        professors: JSON.parse(lecture.professor),
                        semester: lecture.semester,
                        year: lecture.year,
                        schedule: JSON.parse(lecture.schedule),
                    },
                    writer: {
                        studentId: writer.id,
                        name: writer.name,
                        nickname: writer.nickname,
                        level: writer.level,
                        profileImg: writer.UserProfileImg.file,
                    },
                    title: review.title,
                    detail: review.detail,
                    viewCount: review.viewCnt,
                    likeCount: likeCount,
                    isOwner: review.isOwner,
                });
            }
            return data_list;
        } catch (err) {
            console.log(err);
            throw Error(err);
        }
    },
    getAllMyPosts: async (userId) => {
        try {
            let major;
            // // pagination
            // let limit = 10;
            // let offset = 0;
            // if(page > 1) {
            //     offset = (page - 1) * limit;
            // }

            const data_list = [];

            /* ----- lecturePost 찾기 시작 ----- */
            // 내가 작성한 구인글 모두 가져오기
            const lecturePosts = await LecturePost.findAll({
                include: [
                    {
                        model: Role,
                        required: false,
                        include: [
                            {
                                model: RoleApplier,
                                required: false,
                                where: {
                                    group_id: {
                                        [Op.col]: "Roles.id",
                                    },
                                },
                                atrributes: ["group_id", "status", "user_id"],
                            },
                        ],
                        attributes: ["id", "name", "max"],
                    },
                ],
                // pagination
                // offset: offset,
                // limit: limit,
                order: [["createdAt", "DESC"]], // 최신순
                where: {
                    writer_id: userId,
                },
            }).then((res) => {
                return res.map((res) => {
                    return res.dataValues;
                });
            });
            for (let l = 0; l < lecturePosts.length; l++) {
                const lecturePost = lecturePosts[l];
                const lecture = await Lecture.findOne({
                    where: {
                        id: lecturePost.lecture_id,
                    },
                }).then((result) => {
                    return {
                        ...result.dataValues,
                        professor: JSON.parse(result.dataValues.professor),
                    };
                });
                major = await myFindMajor(lecture);
                const writer = await userService.getUserInfo(
                    lecturePost.writer_id
                );
                let total = 0;
                let current = 0;
                let isApply = false;
                let status;
                const isOwner = userId === lecturePost.writer_id;
                lecturePost.Roles.forEach((role) => {
                    total += role.max;
                    role.RoleAppliers.forEach((mem) => {
                        if (mem.status === "success") current++;
                        if (mem.user_id === userId) {
                            isApply = true;
                            status = mem.status;
                        }
                    });
                });
                // data_list 에 push
                data_list.push({
                    type: "lecturePost",
                    data: {
                        id: lecturePost.id,
                        createdAt: lecturePost.createdAt,
                        lecture: {
                            lectureId: lecture.id,
                            name: lecture.name,
                            professors: lecture.professor,
                            semester: lecture.semester,
                            schedule: lecture.schedule,
                        },
                        type: major,
                        writer: {
                            studentId: writer.id,
                            name: writer.name,
                            nickname: writer.nickname,
                            level: writer.level,
                            profileImg: writer.profileImg,
                        },
                        isApply: isApply,
                        status: status ? status : "owner",
                        isOwner: isOwner,
                        endDate: lecturePost.endDate,
                        title: lecturePost.title,
                        detail: lecturePost.detail,
                        viewCount: lecturePost.viewCnt,
                        total: total,
                        current: current,
                    },
                    createdAt: lecturePost.createdAt,
                });
            }
            /* ----- lecturePost 찾기 끝 ----- */
            /* ----- reveiwPost 찾기 시작 ------ */
            const reviews = await LectureReview.findAll({
                order: [["createdAt", "DESC"]],
                where: {
                    writer_id: userId,
                },
            }).then((res) => {
                return res.map((res) => {
                    return {
                        ...res.dataValues,
                    };
                });
            });
            for (let r = 0; r < reviews.length; r++) {
                const review = reviews[r];
                const lecture = await Lecture.findOne({
                    where: {
                        id: review.lecture_id,
                    },
                }).then((result) => {
                    return result.dataValues;
                });
                const writer = await User.findOne({
                    where: { id: review.writer_id },
                    include: [
                        {
                            model: UserProfileImg,
                            required: false,
                            where: { user_id: review.writer_id },
                        },
                    ],
                });
                // likeCount 세기
                let likeCount = 0;
                const likes = await LectureReviewLike.findAll({
                    where: { review_id: review.id },
                }).then((res) => res.map((value) => value.dataValues));
                likes.forEach((like) => {
                    if (like.status === "like") likeCount++;
                });
                data_list.push({
                    type: "lectureReview",
                    data: {
                        id: review.id,
                        lecture: {
                            lectureId: lecture.id,
                            name: lecture.name,
                            professors: JSON.parse(lecture.professor),
                            semester: lecture.semester,
                            year: lecture.year,
                            schedule: JSON.parse(lecture.schedule),
                        },
                        writer: {
                            studentId: writer.id,
                            name: writer.name,
                            nickname: writer.nickname,
                            level: writer.level,
                            profileImg: writer.UserProfileImg.file,
                        },
                        title: review.title,
                        detail: review.detail,
                        viewCount: review.viewCnt,
                        likeCount: likeCount,
                    },
                    createdAt: review.createdAt,
                });
                console.log(data_list);
                const sorted_list = mySort(data_list, null);
                return sorted_list;
            }
        } catch (err) {
            console.log(err);
            return;
        }
    },
};
