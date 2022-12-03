const { LecturePost } = require("../models");
const passport = require("passport");
const jwt = require("../utils/jwt-util");

module.exports = {
    createPosting: async (body) => {
        return LecturePost.create({
            id: body.id,
            title : body.title,
            endDate: body.endDate,
            detail: body.detail,
            priority: body.priority,
            charLink: body.charLink,
            viewCnt: body.viewCnt,
            status: body.status,
            period: body.period,
            //TODO 외래키 추가
    
        })
            .then((newUser) => {
                return newUser;
            })
            .catch((e) => {
                console.log("create user error..." + e);
            });
    },
    // 다른 function
}