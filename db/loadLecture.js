const fs = require("fs");
const path = require("path");
const { Lecture } = require("../models");
const lectures = [
    "electives_22.json",
    "re_electives_22.json",
    "lecture_22.json",
];
module.exports = {
    loadMajor: async () => {
        const store = await Lecture.findAll();
        if (store.length === 0)
            for (let l = 0; l < lectures.length; l++) {
                const filePath = path.join(__dirname, lectures[l]);
                const fileData = fs.readFileSync(filePath).toString();
                const data = JSON.parse(fileData);

                for (let i = 0; i < data.length; i++) {
                    for (let j = 0; j < data[i].length; j++) {
                        if (data[i][j].id !== null)
                            await Lecture.findOrCreate({
                                where: {
                                    code: data[i][j].id,
                                    year: data[i][j].year,
                                    semester: data[i][j].semester,
                                    univ: data[i][j].univ,
                                    major: data[i][j].major,
                                    major_detail: data[i][j].major_detail,
                                    name: data[i][j].name,
                                    group: data[i][j].group,
                                    professor:
                                        data[i][j].professor == ""
                                            ? null
                                            : JSON.stringify(
                                                  data[i][j].professor
                                              ),
                                    schedule:
                                        data[i][j].schedule.length == 0
                                            ? null
                                            : JSON.stringify(
                                                  data[i][j].schedule
                                              ),
                                    target:
                                        data[i][j].target.length == 0
                                            ? null
                                            : JSON.stringify(data[i][j].target),
                                },
                            });
                    }
                }
            }
    },
};
