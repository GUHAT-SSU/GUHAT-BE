const { Lecture } = require("../models");
const { Op } = require("sequelize");
module.exports = {
    findLecture: async (data, user) => {
        try {
            const title = data.title;
            const professor = data.professor;
            const day = data.day;
            const time = data.time;
            const place = data.place;
            const semester = data.semester;
            const year = data.year;
            const target = data.target ? data.target : null;
            const major = data.major;

            console.log(data);
            const result = await Lecture.findAll({
                where: {
                    [Op.and]: {
                        name: { [Op.like]: "%" + title + "%" },
                        semester: { [Op.like]: "%" + semester + "%" },
                        professor: { [Op.like]: "%" + professor + "%" },
                        year: year,
                        schedule: {
                            [Op.like]: "%" + time + "%",
                        },
                    },
                },
            }).then((res) => {
                return res.map((val, idx) => {
                    return val.dataValues;
                });
            });
            if (result.length > 1) {
                const filter = result.filter(
                    (lecture, i) => result.indexOf(lecture) === i
                );

                const lecture = [];
                filter.map((l, idx) => {
                    if (
                        l.schedule.includes(day) &&
                        (place ? l.schedule.includes(place) : true) &&
                        (l.target
                            ? l.target.includes(major) &&
                              l.target.includes(user.grade)
                            : false)
                    )
                        lecture.push(l);
                });
                return lecture;
            } else return result;
        } catch (err) {
            console.log(err);
            return;
        }
    },
};
