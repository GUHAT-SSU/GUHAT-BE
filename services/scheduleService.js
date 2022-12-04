const { User, Schedule } = require("../models");

module.exports = {
    findScheduleByUserId: async (userId) => {
        const schedules = [];
        try {
            const res = await Schedule.findAll({
                where: { user_id: userId },
            }).catch((err) => {
                console.log(err);
            });
            res.forEach((element) => {
                schedules.push(element);
            });
            return schedules;
        } catch (error) {
            console.log(error);
            return null;
        }
    },

    findDetailSchedule: async (userId, year, semester) => {
        const schedules = [];
        try {
            const res = await Schedule.findAll({
                where: { user_id: userId, year: year, semester: semester },
            }).catch((err) => {
                console.log(err);
            });
            res.forEach((element) => {
                schedules.push(element);
            });
            return schedules;
        } catch (error) {
            console.log(error);
        }
    },
};
