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
            return await Profile.findAll({
                where: {
                    mode: "public",
                    skill: {
                        [Op.like]: "%" + stack + "%",
                    },
                },
            }).then((res) => {
                const profiles = res.map((profile) => {
                    return {
                        ...profile.dataValues,
                        personality: JSON.parse(profile.dataValues.personality),
                        skill: JSON.parse(profile.dataValues.skill),
                    };
                });

                return profiles;
            });
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },
};