const { options } = require("../models/user");
const lectureService = require("../services/lectureService");
const profileService = require("../services/profileService");

module.exports = {
    getSeachResult: async (req, res) => {
        try {
            const option = req.query.option;
            const keyword = req.query.keyword;

            if (
                !(
                    option === "lecture" ||
                    option === "professor" ||
                    option === "stack"
                )
            ) {
                return res.status(400).json({
                    ok: false,
                    message: "잘못된 쿼리 요청",
                });
            }
            let result;
            if (option === "lecture") {
                result = await lectureService.findLectureByName(keyword);
            } else if (option === "professor") {
                result = await lectureService.findLectureByProfessor(keyword);
            } else {
                result = await profileService.findProfileBySkill(keyword);
            }

            return res.status(200).json({
                ok: true,
                message: option + "/ 검색 결과 가져오기 성공",
                data: result,
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                message: err,
            });
        }
    },
};
