const { parse } = require("dotenv");
const { Op } = require("sequelize");
const {
    LecturePost,
    Lecture,
    User,
    Role,
    RoleApplier,
    Profile,
} = require("../models");
const { myFindMajor, mySort } = require("../utils/myFunction");

module.exports = {
    /* ------- GET : 작성한 구인글 리스트 조회 --------- */
    findMyPosts: async (writer_id, page) => {
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
                where: {
                    writer_id: writer_id,
                },
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
                    return result.dataValues;
                });

                major = await myFindMajor(lecture);

                const writer = await User.findByPk(writer_id);
                // total : 해당 포스트의 총 지원자 수
                // current : status == "success"인 사람
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
                });
                // data_list 정리
                data_list.push({
                    id: lecturePost.id,
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
                        // profileImg: profileImg.file
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
            throw new Error(err);
        }
    },
    /* ------- GET : 작성한 구인글 리스트 조회 끝--------- */

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
