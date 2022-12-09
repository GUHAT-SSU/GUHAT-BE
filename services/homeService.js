const { ConsoleMessage } = require("puppeteer");
const { LecturePost, Lecture, User, Role, RoleApplier, UserProfileImg} = require("../models");

module.exports = {
    findLecturePosts: async (userId) => {
        try{
            console.log("start!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            let major;
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
           const lecturePosts = await LecturePost.findAll({
            where: {
                writer_id: userId 
            },
            limit: 10, // 나중에 수정
            order: [['createdAt', 'DESC']] // 최신순
           }).then((res) => {
            return res.map((res) => {
                return res.dataValues
            })   
           })
           console.log("lecturePosts : ", lecturePosts);
           //const lecturePosts = result.map( res => res.dataValues);

           const data_list = [];

           for(let l = 0; l < lecturePosts.length; l++) {
                // post에서 가져온 lecure_id로 Lecture에서 해당 과목 찾기
                const lecturePost = lecturePosts[l];
                console.log("개별 post : ", lecturePost); 
                const lecture = await Lecture.findOne({
                    where: {
                        id: lecturePost.lecture_id
                    }
                })
                console.log("finded lecture.major : ", lecture.major);
                
                // major 항목이 null -> elective / null이 아니면 -> major 를 반환
                if(lecture.major == null) {
                    major = "elective" 
                } else {
                    major = "major"
                }
                console.log("major : " + major);

                // 유저 찾아서 프로필 이미지 가져오기
                const writer = await User.findByPk(userId);
                console.log("writer : " + writer.id);

                const profileImg = await UserProfileImg.findOne({
                    where: {
                        user_id: userId
                    }
                }); 
                console.log("profileImg : " + profileImg.id);

                const total = await RoleApplier.findAndCountAll({
                    where: {
                        lecturePost_id: lecturePost.id
                    }
                }).then((result => {
                    return result.count;
                }))
                console.log("total : " + total);

                const current = await RoleApplier.findAndCountAll({
                    where: {
                        lecturePost_id: lecturePost.id,
                        status: "success"
                    }
                }).then(result => {
                    return result.count;
                })
                console.log("current : " + current);
                

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
                        profileImg: profileImg.file
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

            
        } catch(err) {
            console.log(err);
            throw Error(err);
        }
    },
}
