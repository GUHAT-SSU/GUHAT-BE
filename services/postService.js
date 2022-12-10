
const { LecturePost, Lecture, User, Role, RoleApplier} = require("../models");
const { myFindMajor, mySort } = require("../utils/myFunction");

module.exports = {
    /* ------ POST : 게시물 생성 ------ */
    createPost: async (userId, body) => {
        try {
            const newPost = await LecturePost.create({
                title : body.title,
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
            for(let r = 0; r < body.role.length; r++) {
                // 새 그룹 생성
                const newRole = await Role.create({
                    name: body.role[r].name,
                    max: body.role[r].max,
                    lecturePost_id: newPost.id
                })
                // console.log("role exists? : ");
                // console.log(newRole.id);
            }
            console.log("newPost exists? : ");
            console.log(newPost.id);
            return {
                type: "Success",
                message: "You successfully created a new post!",
                postId: newPost.dataValues.id
            }
        } catch(err) {
            console.log(err);
            return {
                type: "Error",
                message: err.toString()
            }
        }
        
    },
    /* ------ POST : 게시물 생성 끝 ------ */
    /* ------ POST : 팀플 지원하기 ------- */
    apply: async (userId, postId, roleId) => {
        try{
            // 이 포스트에 있는 기존 지원자 리스트 가져오기
            const existApplier = await RoleApplier.findAll({
                where: {
                    lecturePost_id: postId
                }
            });
    
            // 지원하기를 두 번 눌렀을 경우
            for(let a = 0; a < existApplier.length; a++) {
                if(existApplier[a].user_id == userId) {
                    return {
                        type: "Error",
                        message: "User already applied to this post!"
                    }
                }   
            }
            // 새 지원자 생성
            const newApplier = await RoleApplier.create({
                group_id: roleId,
                user_id: userId,
                lecturePost_id: postId
            });
            console.log("newApplier exists? : " , newApplier.id);
            return {
                type: 'Success',
                statusCode: 200,
                message: "You successfully applied to the lecture!",
                userId: userId,
                applierId: newApplier.id
            };
        }catch(err) {
            console.log(err);
            return {
                type: "Error",
                message: err.toString()
            }
        }
    },
    /* ---------- POST : 팀플 지원하기 끝 ----------- */
    /* ------- GET : 구인글 리스트 모두 조회 -------- */
    findAllPosts: async (sort, page, userId) => {
        try{
            let isMine = false;
            let major; 
            // pagination
            let limit = 10;
            let offset = 0; 
            if(page > 1) {
                offset = limit * (page - 1);
            }

            // 구인글 모두 가져오기
            const lecturePosts = await LecturePost.findAll({
                // pagenation
                offset: offset,
                limit: limit,
                order: [["createdAt", 'DESC']] // 최신순
            }).then((result) => {
                return result.map((res) => {
                    return res.dataValues
                })
            });

            const data_list = [];

            for (let l = 0; l < lecturePosts.length; l++) {
                const lecturePost = lecturePosts[l];
                // 내가 작성한 구인글 찾기
                if(userId == lecturePost.writer_id) {
                    isMine = true;
                }
                // lecturePost의 lecture_id로 Lecture에서 해당 과목 찾기
                const lecture = await Lecture.findOne({
                    where: {
                        id: lecturePost.lecture_id
                    }
                })
                .then((result) => {
                    return result.dataValues
                });

                major = await myFindMajor(lecture);

                const writer = await User.findByPk(lecturePost.writer_id);

                // total : 해당 포스트의 총 지원자 수
                // current : status == "success"인 사람
                const total = await RoleApplier.findAndCountAll({
                    where: {
                        lecturePost_id: lecturePost.id
                    },
                    distinct: true // 연결된 테이블로 인해 count가 바뀌는 현상을 막을 수 있다
                })
                .then((result) => {
                    return result.count;
                })
                const current = await RoleApplier.findAndCountAll({
                    where: {
                        lecturePost_id: lecturePost.id,
                        status: "success"
                },
                distinct: true // 연결된 테이블로 인해 count가 바뀌는 현상을 막을 수 있다
                })
                .then((result) => {
                    return result.count;
                })
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
                    },
                    endDate: lecturePost.endDate,
                    title: lecturePost.title,
                    detail: lecturePost.detail,
                    viewCount: lecturePost.viewCnt,
                    total: total,
                    current: current,
                    isMine: isMine
                });
            }
            // sort 옵션별로 변수 지정
            const sorted_list = mySort(data_list, sort); 
            
            return sorted_list;
            
        } catch(err) {
            console.log(err);
            throw Error(err);
        }
    },
    /* ------- GET : 구인글 리스트 모두 조회 끝 -------- */
}