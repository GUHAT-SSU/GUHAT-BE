const userService = require("../services/userService");

const scheduleService = require("../services/scheduleService");
const { User } = require("../models");

module.exports = {
    getUserInfo: async (req, res) => {
        try {
            const id = req.userId;
            const user = await userService.findUserById(id);
            const result = {
                ...user,
                profileImg: user.UserProfileImg
                    ? user.UserProfileImg.file
                    : null,
            };
            delete result.UserProfileImg;
            delete result.token;
            delete result.password;

            return res.status(200).send({
                ok: true,
                data: { ...result },
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                ok: false,
                message: error.message,
            });
        }
    },

    updateProfileImage: async (req, res, next) => {
        console.log(req.files);
        const profileImg = req.files ? req.files[0]?.location : null;
        const nickname = req.query.nickname;

        try {
            if (nickname === "")
                return res.status(400).json({
                    message: "닉네임은 필수 입니다",
                });
            await userService.updateUserInfoById(
                req.userId,
                nickname,
                profileImg ? profileImg : null
            );
            return res.status(200).json({
                message: "회원 정보 업데이트 성공",
                data: { nickname, profileImg: profileImg ? profileImg : null },
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },

    getSchedule: async (req, res) => {
        console.log(`userId ? ${req.userId}`);
        try {
            const result = await scheduleService.findScheduleByUserId(
                req.userId
            );
            console.log(`userSchedule : ${result}`);
            return res.status(200).send({
                ok: true,
                message: "success to load schedule",
                data: result,
            });
        } catch (error) {
            return res.status(400).send({
                ok: false,
                message: error.message,
            });
        }
    },
};
