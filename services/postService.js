const { Op } = require("sequelize");
const {
    LecturePost,
    Lecture,
    User,
    Role,
    RoleApplier,
    LectureProject,
    LectureProjectMember,
    LectureReview,
    LectureReviewFile,
    LectureReviewLike,
    sequelize,
} = require("../models");
const { myFindMajor, mySort } = require("../utils/myFunction");
const lectureService = require("./lectureService");
const userService = require("./userService");

module.exports = {
    /* ------ POST : 게시물 생성 ------ */
    createPost: async (userId, body) => {
        try {
            const l = await Lecture.findOne({ where: { id: body.lecture_id } });
            console.log(l);
            const newPost = await LecturePost.create({
                title: body.title,
                endDate: body.endDate,
                detail: body.detail,
                priority: body.priority,
                chatLink: body.chatLink,
                status: body.status,
                period: body.period,
                //외래키
                writer_id: userId,
                lecture_id: body.lecture_id,
            });
            console.log("body.role", body.role.length);
            for (let r = 0; r < body.role.length; r++) {
                // 새 그룹 생성
                const newRole = await Role.create({
                    name: body.role[r].name,
                    max: body.role[r].max,
                    lecturePost_id: newPost.id,
                });
            }
            console.log("newPost exists? : ");
            console.log(newPost);
            return {
                type: "Success",
                message: "You successfully created a new post!",
                postId: newPost.dataValues.id,
            };
        } catch (err) {
            console.log(err);
            return {
                type: "Error",
                message: err.toString(),
            };
        }
    },
    /* ------ POST : 게시물 생성 끝 ------ */
    /* ------ POST : 팀플 지원하기 ------- */
    apply: async (userId, postId, roleId) => {
        try {
            // 이 포스트에 있는 기존 지원자 리스트 가져오기
            const existApplier = await RoleApplier.findAll({
                where: {
                    lecturePost_id: postId,
                },
            });

            // 지원하기를 두 번 눌렀을 경우
            for (let a = 0; a < existApplier.length; a++) {
                if (existApplier[a].user_id == userId) {
                    return {
                        type: "Error",
                        message: "User already applied to this post!",
                    };
                }
            }
            // 새 지원자 생성
            const newApplier = await RoleApplier.create({
                group_id: roleId,
                user_id: userId,
                lecturePost_id: postId,
            });
            console.log("newApplier exists? : ", newApplier.id);
            return {
                type: "Success",
                statusCode: 200,
                message: "You successfully applied to the lecture!",
                userId: userId,
                applierId: newApplier.id,
            };
        } catch (err) {
            console.log(err);
            return {
                type: "Error",
                message: err.toString(),
            };
        }
    },
    /* ---------- POST : 팀플 지원하기 끝 ----------- */

    getMember: async (postId) => {
        /* 지원 성공한 멤버 반환*/
        try {
            const memberList = [];
            const data = await Role.findAll({
                where: {
                    lecturePost_id: postId,
                },
                include: {
                    model: RoleApplier,

                    where: {
                        status: "success",
                        group_id: {
                            [Op.col]: "Role.id",
                        },
                    },
                },
            });

            data?.forEach((applier) => {
                applier.RoleAppliers.forEach((mem) => {
                    memberList.push(mem.dataValues.user_id);
                });
            });
            return memberList;
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },

    /* ---------- POST : 팀플 지원자 수락 ----------- */
    updateMember: async (roleId, postId, member) => {
        try {
            for (let i = 0; i < member.length; i++) {
                await RoleApplier.update(
                    { status: "success" },
                    {
                        where: {
                            group_id: roleId,
                            user_id: member[i],
                            lecturePost_id: postId,
                        },
                    }
                );
            }
            return;
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },

    /* ------- GET : 구인글 리스트 모두 조회 -------- */
    findAllPosts: async (sort, page, userId) => {
        try {
            let isMine = false;
            let major;
            // pagination
            let limit = 10;
            let offset = 0;
            if (page > 1) {
                offset = limit * (page - 1);
            }

            // 구인글 모두 가져오기
            const lecturePosts = await LecturePost.findAll({
                // pagenation
                offset: offset,
                limit: limit,
                order: [["createdAt", "DESC"]], // 최신순
            }).then((result) => {
                return result.map((res) => {
                    return res.dataValues;
                });
            });

            const data_list = [];

            for (let l = 0; l < lecturePosts.length; l++) {
                const lecturePost = lecturePosts[l];
                // 내가 작성한 구인글 찾기

                // lecturePost의 lecture_id로 Lecture에서 해당 과목 찾기
                const lecture = await Lecture.findOne({
                    where: {
                        id: lecturePost.lecture_id,
                    },
                }).then((result) => {
                    return result.dataValues;
                });

                major = await myFindMajor(lecture);

                const writer = await User.findByPk(lecturePost.writer_id);

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

                console.log("is mine", isMine);

                // data_list 정리
                data_list.push({
                    id: lecturePost.id,
                    createdAt: lecturePost.createdAt,
                    lecture: {
                        lectureId: lecture.id,
                        name: lecture.name,
                        professors: JSON.parse(lecture.professor),
                        semester: lecture.semester,
                        schedule: JSON.parse(lecture.schedule),
                    },
                    type: major,
                    writer: {
                        studentId: writer.id,
                        name: writer.name,
                        nickname: writer.nickname,
                        level: writer.level,
                    },
                    endDate: lecturePost.endDate,
                    title: lecturePost.title,
                    detail: lecturePost.detail,
                    viewCount: lecturePost.viewCnt,
                    total: total,
                    current: current,
                    isMine: writer.id === userId,
                });
            }
            // sort 옵션별로 변수 지정
            const sorted_list = mySort(data_list, sort);

            return sorted_list;
        } catch (err) {
            console.log(err);
            throw Error(err);
        }
    },
    /* ------- GET : 구인글 리스트 모두 조회 끝 -------- */
    /* ------- GET : 구인글 조회 -------- */
    getPost: async (postId) => {
        try {
            const post = await LecturePost.findByPk(postId, {
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
                                attributes: ["group_id", "status", "user_id"],
                            },
                        ],
                        attributes: ["id", "name", "max"],
                    },
                ],
            }).then((res) => {
                if (res) return res.dataValues;
                else return res;
            });

            await LecturePost.update(
                { viewCnt: sequelize.literal("viewCnt + 1") },
                { where: { id: postId } }
            );
            const lecture = await Lecture.findByPk(post.lecture_id).then(
                (res) => {
                    return {
                        ...res.dataValues,
                        schedule: JSON.parse(res.dataValues.schedule),
                        professor: JSON.parse(res.dataValues.professor),
                    };
                }
            );
            return {
                ...post,
                lecture,
            };
        } catch (err) {
            console.log(err);
            throw Error(err);
        }
    },

    /* ------- GET : 수업 해당 구인글 조회 -------- */
    findPostByLectureId: async (sort, page, lectureId, userId) => {
        try {
            let limit = 10;
            let offset = 0;
            if (page > 1) {
                offset = limit * (page - 1);
            }

            const lecturePosts = await LecturePost.findAll({
                where: { lecture_id: lectureId },
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
                                attributes: ["group_id", "status", "user_id"],
                            },
                        ],
                        attributes: ["id", "name", "max"],
                    },
                ],
                offset: offset,
                limit: limit,
                order: [["createdAt", "DESC"]], // 최신순
            }).then((res) => {
                console.log(res);
                return res.map((r) => r.dataValues);
            });

            const data_list = [];

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
                        schedule: JSON.parse(result.dataValues.schedule),
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
                // data_list 정리

                data_list.push({
                    id: lecturePost.id,
                    createdAt: lecturePost.createdAt,
                    lecture: lecture,
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
                });
            }

            const sorted_list = mySort(data_list, sort);

            return sorted_list;
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },
    /* --------- 팀플 리뷰 리스트 전체 조회  ----------- */
    findAllReviews: async (userId, sort, page) => {
        try {
            // pagination
            let limit = 10;
            let offset = 0;
            if (page > 1) {
                offset = limit * (page - 1);
            }
            const reviews = await LectureReview.findAll().then((res) => {
                return res.map((res) => {
                    return {
                        ...res.dataValues,
                        // 작성자인지 보여주기
                        isOwner: res.dataValues.writer_id === userId,
                    };
                });
            });
            const data_list = [];
            for (let r = 0; r < reviews.length; r++) {
                const review = reviews[r];
                // 해당 과목 정보 불러오기
                const lecture = await Lecture.findOne({
                    where: {
                        id: review.lecture_id,
                    },
                }).then((result) => {
                    return {
                        ...result.dataValues,
                        professor: JSON.parse(result.dataValues.professor),
                        schedule: JSON.parse(result.dataValues.schedule),
                    };
                });
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
                    raw: true,
                });
                likes.forEach((like) => {
                    if (like.status === "like") {
                        likeCnt++;
                    }
                });
                data_list.push({
                    lecture,
                    review: {
                        id: review.id,
                        title: review.title,
                        reviewLevel: review.level,
                        memeberNum: review.memberNum,
                        fileCnt: fileCnt,
                        detail: review.detail,
                        nickname: writer.nickname,
                        writerLevel: writer.level,
                        viewCount: review.viewCnt,
                        likeCnt: likeCnt,
                        createdAt: review.createdAt,
                        isOwner: review.isOwner,
                    },
                });
            }
            const sorted_list = mySort(data_list, sort);
            return sorted_list;
        } catch (err) {
            console.log(err);
            return;
        }
    },
};
