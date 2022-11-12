const { User, Schedule } = require("../models");

module.exports = {
    createSchedule: async (userId, schedule) => {
        try {
            for (let i = 0; i < schedule.length; i++) {
                const semesterSchedule = schedule[i];
                console.log("sememester ---------------- ");
                console.log(semesterSchedule);
                for (let j = 0; j < semesterSchedule.data.length; j++) {
                    const item = semesterSchedule.data[j];
                    console.log("item ---------------- ");
                    console.log(item);
                    for (let k = 0; k < item.length; k++) {
                        if (item[k] !== null)
                            Schedule.create({
                                year: semesterSchedule.year,
                                semester: semesterSchedule.semester,
                                name: item[k].name,
                                professor:
                                    item[k].professor == ""
                                        ? null
                                        : item[k].professor,
                                time: item[k].time == "" ? null : item[k].time,
                                place:
                                    item[k].place == "" ? null : item[k].place,
                                user_id: userId,
                            });
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    },

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
        }
    },
};
