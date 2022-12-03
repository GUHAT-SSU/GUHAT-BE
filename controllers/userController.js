const {
    usaintLogin,
    getProfile,
    getSchedule,
} = require("../utils/crawling-util");
const userService = require("../services/userService");

const scheduleService = require("../services/scheduleService");

module.exports = {
    getUserInfo: async (req, res) => {
        try {
            const id = req.userId;
            const user = await userService.findUserById(id);
            return res.status(200).send({
                ok: true,
                data: user,
            });
        } catch (error) {
            return res.status(400).send({
                ok: false,
                message: error.message,
            });
        }
    },
    //TODO 학기 선택 request 추가 + schedule Cashing
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
