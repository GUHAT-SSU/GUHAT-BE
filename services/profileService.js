const { parse } = require("dotenv");
const { Op } = require("sequelize");
const {
    LecturePost,
    Lecture,
    User,
    Role,
    RoleApplier,
    Profile,
    ProfileFile,
    ProfileLike,
    LectureReview,
    LectureReviewFile,
    LectureReviewLike,
    MemberReview,
} = require("../models");
const { myFindMajor, mySort } = require("../utils/myFunction");
const userService = require("./userService");

const createProfile = async (userId) => {
    try {
        return await Profile.create({
            detail: "",
            personality: JSON.stringify([0, 0, 0]),
            mode: "public",
            introduction: "",
            skill: JSON.stringify([]),
            user_id: userId,
        }).then((res) => res.dataValues);
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
};

module.exports = {
    /* ------- 프로필 최초 생성---- ----- */
    createProfile,

    /* ------- 프로필 조회 ---- ----- */
    findProfileByUserId: async (userId) => {
        try {
            const profile = await Profile.findOne({
                where: { user_id: userId },
                raw: true,
            });
            if (!profile) {
                return await createProfile(userId);
            }
            return profile;
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },

    /* ------- 프로필 공개범위  수정 ---- ----- */
    updateProfileMode: async (userId, mode) => {
        try {
            return await Profile.update(
                { mode: mode },
                { where: { user_id: userId } }
            );
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },

    /* ------- 프로필 소개란 수정 ---- ----- */
    updateProfileIntro: async (userId, intro, detail) => {
        try {
            return await Profile.update(
                { detail: detail, introduction: intro },
                { where: { user_id: userId } }
            );
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },

    /* ------- 프로필 상세 수정 ---- ----- */
    updateProfileDetail: async (userId, skill, personality) => {
        try {
            return await Profile.update(
                {
                    skill: JSON.stringify(skill),
                    personality: JSON.stringify(personality),
                },
                { where: { user_id: userId } }
            );
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },

    /* ------- 프로필 포트폴리오 파일 추가---- ----- */
    addProfileFile: async (userId, files) => {
        try {
            const profile = await Profile.findOne({
                where: { user_id: userId },
            });

            if (!profile) return;
            for (let i = 0; i < files.length; i++) {
                await ProfileFile.create({
                    file: files[i],
                    user_id: userId,
                    profile_id: profile.id,
                });
            }
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },

    deleteProfileFile: async (userId, file) => {
        console.log("delte", file);
        console.log("user", userId);
        try {
            const deleteFile = await ProfileFile.destroy({
                where: {
                    [Op.and]: {
                        file: { [Op.like]: "%" + file + "%" },
                        user_id: userId,
                    },
                },
            });
            console.log(deleteFile);
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },

    /* ------- GET : 참여 이력 조회 --------- */
    findMyPosts: async (userId, page) => {
        try {
            let major;
            // pagination
            let limit = 10;
            let offset = 0;
            if (page > 1) {
                offset = (page - 1) * limit;
            }
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
                                attributes: ["group_id", "status", "user_id"],
                            },
                        ],
                        attributes: ["id", "name", "max"],
                    },
                ],
                // pagination
                offset: offset,
                limit: limit,
                order: [["createdAt", "DESC"]], // 최신순
            }).then((res) => {
                return res.map((res) => {
                    return res.dataValues;
                });
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
                    };
                });

                major = await myFindMajor(lecture);

                const writer = await userService.getUserInfo(
                    lecturePost.writer_id
                );
                // total : 해당 포스트의 총 지원자 수
                // current : status == "success"인 사람
                // const total = await RoleApplier.findAndCountAll({
                //     where: {
                //         lecturePost_id: lecturePost.id,
                //     },
                //     distinct: true, // 연결된 테이블로 인해 count가 바뀌는 현상을 막을 수 있다
                // }).then((result) => {
                //     return result.count;
                // });
                // console.log("total : " + total);

                // const current = await RoleApplier.findAndCountAll({
                //     where: {
                //         lecturePost_id: lecturePost.id,
                //         status: "success",
                //     },
                //     distinct: true, // 연결된 테이블로 인해 count가 바뀌는 현상을 막을 수 있다
                // }).then((result) => {
                //     return result.count;
                // });

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
                if (isOwner || isApply)
                    data_list.push({
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
                    });
            }
            return data_list;
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },
    /* ------- GET : 참여 이력 조회 끝--------- */

    /* ------- GET : 프로필 검색 결과---- ----- */
    findProfileBySkill: async (stack) => {
        try {
            const data_list = [];
            const profiles = await Profile.findAll({
                where: {
                    mode: "public",
                    skill: {
                        [Op.like]: "%" + stack + "%",
                    },
                },
                raw: true,
            });

            for (let i = 0; i < profiles.length; i++) {
                const user = await userService.getUserInfo(profiles[i].user_id);
                data_list.push({
                    ...profiles[i],
                    personality: JSON.parse(profiles[i].personality),
                    skill: JSON.parse(profiles[i].skill),
                    user,
                });
            }
            console.log(data_list);
            return data_list;
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },
    /* 이력서 추천 / 비추천 */
    createProfileLike: async (userId, profiileId, isLike) => {
        try {
            const profile = await Profile.findOne({
                where: { id: profileId },
            });
            if (isLike) {
                const like = await ProfileLike.create({
                    profile_id: profile.id,
                    liker_id: userId,
                    owner_id: profile.user_id,
                }).then((res) => {
                    console.log("이력서 추천 성공!", res.id);
                });
                return {
                    message: "이력서 추천 성공!",
                };
            } else {
                const dislike = await ProfileLike.destroy({
                    where: {
                        profile_id: profile.id,
                        liker_id: userId,
                        owner_id: profile.user_id,
                    },
                }).then((res) => {
                    console.log("이력서 비추천 성공!", res.id);
                });
                return {
                    message: "이력서 비추천 성공!",
                };
            }
        } catch (err) {
            console.log(err);
            return;
        }
    },
    findMyReview: async (page, userId) => {
        try {
            // pagination
            let limit = 10;
            let offset = 0;
            if (page > 1) {
                offset = (page - 1) * limit;
            }
            const data_list = [];
            // 해당 과목 리뷰글 모두 가져오기
            const reviews = await LectureReview.findAll({
                order: [["createdAt", "DESC"]],
                where: {
                    writer_id: userId,
                },
                // pagination
                offset: offset,
                limit: limit,
            }).then((res) => {
                return res.map((res) => {
                    return {
                        ...res.dataValues,
                    };
                });
            });
            for (let r = 0; r < reviews.length; r++) {
                const review = reviews[r];
                // 해당 과목 정보 불러오기
                const lecture = await Lecture.findOne({
                    where: {
                        id: review.lecture_id,
                    },
                }).then((res) => {
                    return {
                        ...res.dataValues,
                        professor: JSON.parse(res.dataValues.professor),
                        schedule: JSON.parse(res.dataValues.schedule),
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
                        viewCnt: review.viewCnt,
                        likeCnt: likeCnt,
                        createdAt: review.createdAt,
                    },
                });
            }
            return data_list;
        } catch (err) {
            console.log(err);
            return;
        }
    },
    findMemberReview: async (userId, profileId) => {
        try {
            const reviewList = [];
            const isOwner = await Profile.findOne({
                where: { user_id: userId },
            }).then((res) => {
                if (res.dataValues.id === profileId) {
                    return true;
                } else {
                    return false;
                }
            });
            const profileOwnerId = await Profile.findOne({
                where: {
                    id: profileId,
                },
            }).then((res) => {
                return res.dataValues.user_id;
            });
            // 멤버 리뷰 모두 불러오기
            const memberReviews = await MemberReview.findAll({
                where: { receiver_id: profileOwnerId },
            }).then((res) => {
                return res.map((res) => {
                    return {
                        ...res.dataValues,
                    };
                });
            });
            for (let r = 0; r < memberReviews.length; r++) {
                const memberReview = memberReviews[r];
                reviewList.push({
                    createdAt: memberReview.createdAt,
                    score: memberReview.score,
                    comment: memberReview.comment,
                    emojiType: memberReview.emojiType,
                });
            }
            return { isOwner, reviewList };
        } catch (err) {
            console.log(err);
            return;
        }
    },
};
