const {
    authLogin,
    getProfile,
    toSchedulePage,
} = require("../utils/crawling-util");

module.exports = {
    //TODO DB MODEL 과 연동하기 + Cashing
    getUserInfo: async (req, res) => {
        try {
            const result = await authLogin(req, res);
            if (!result) {
                return res.status(401).send({
                    ok: false,
                    message: "No authorized!",
                });
            }
            await getProfile(req, res);
        } catch (error) {
            return res.status(400).send({
                ok: false,
                message: error.message,
            });
        }
    },
    //TODO 학기 선택 request 추가 + schedule Cashing
    getSchedule: async (req, res) => {
        try {
            const result = await authLogin(req, res);
            if (!result) {
                return res.status(401).send({
                    ok: false,
                    message: "No authorized!",
                });
            }
            const schedule = await toSchedulePage(req, res);
            if (!schedule) {
                return res.status(500).send({
                    ok: false,
                    message: "Schedule parsing error!",
                });
            } else {
                return res.status(200).send({
                    ok: true,
                    message: "success to parsing schedule",
                    data: schedule,
                });
            }
        } catch (error) {
            return res.status(400).send({
                ok: false,
                message: error.message,
            });
        }
    },
};
