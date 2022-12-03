const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let browser = null;

const usaintLogin = async (id, pw) => {
    // const id = "20201725";
    // const pw = "kimhyomin667~";
    console.log(id + pw);
    browser = await puppeteer.launch({
        headless: false,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-first-run",
            "--no-sandbox",
            "--no-zygote",
            "--deterministic-fetch",
            "--disable-features=IsolateOrigins",
            "--disable-site-isolation-trials",
            // '--single-process',
        ],
    });
    try {
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        //usaint 로그인 페이지
        await page.goto(
            "https://smartid.ssu.ac.kr/Symtra_sso/smln.asp?apiReturnUrl=https%3A%2F%2Fsaint.ssu.ac.kr%2FwebSSO%2Fsso.jsp",
            { waitUntil: "load" }
        );

        await page.waitForSelector("#userid");
        await page.focus("#userid");
        await page.keyboard.type(id);
        await page.waitForSelector("#pwd");
        await page.focus("#pwd");
        await page.keyboard.type(pw);
        await page.click(".btn_login");
        page.on("dialog", (dialog) => {
            console.log("Dialog is up...");
            delay(1000);
            console.log("Accepted..." + dialog.message());
            //SAP NetWeaver - 로그온 준비 중입니다.
            dialog.accept();

            const res = { ok: false, message: dialog.message() };

            page.close();
            return res;
        });
        await page.waitForNavigation({ timeout: 10000 });
        page.close();
        return { ok: true, message: "usaint login success" };
    } catch (e) {
        console.log(e);
        return { ok: false, message: e.mesage };
    }
};

const getProfile = async (id, pw) => {
    let result = true;

    try {
        const page2 = await browser.newPage();
        await page2.setDefaultNavigationTimeout(0);
        /* 학적 정보 페이지 이동 */
        await page2.goto(
            "https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMW1001n?sap-language=KO#",
            { waitUntil: "load" }
        );
        page2.frames().forEach((frame) => {
            frame.title().then((t) => {
                console.log("로그온?" + t);
            });
        });

        await page2.waitForSelector("#WD8E").catch((e) => {
            console.log("페이지 오류" + e.message);
            page2.clolse();
            return { ok: false, message: "잘못된 페이지 접근" };
        });

        const entranceYear = await page2.evaluate(
            () => document.querySelector("#WD8E").value
        );
        await page2.waitForSelector("#WD97");
        const studentID = await page2.evaluate(
            () => document.querySelector("#WD97").value
        );
        await page2.waitForSelector("#WDA0");
        const name = await page2.evaluate(
            () => document.querySelector("#WDA0").value
        );
        await page2.waitForSelector("#WDB8");
        const grade = await page2.evaluate(
            () => document.querySelector("#WDB8").value
        );
        await page2.waitForSelector("#WD92");
        const univ = await page2.evaluate(
            () => document.querySelector("#WD92").value
        ); //단과대
        await page2.waitForSelector("#WD9B");
        const major = await page2.evaluate(
            () => document.querySelector("#WD9B").value
        ); //학과
        await page2.waitForSelector("#WDAD");
        const group = await page2.evaluate(
            () => document.querySelector("#WDAD").value
        ); //분반
        await page2.waitForSelector("#WDBC");
        const semester = await page2.evaluate(
            () => document.querySelector("#WDBC").value
        ); //학기

        // 정보
        const entrance = {
            name: name,
            entranceYear: entranceYear,
            studentId: studentID,
            grade: grade,
            univ: univ,
            major: major,
            group: group,
            semester: semester,
        };
        await page2.close();
        await browser.close();
        return {
            ok: true,
            data: entrance,
            message: "[Succes] usaint parsing ",
        };
    } catch (error) {
        console.log(error);
        await page2.close();
        await browser.close();
        return { ok: false, message: "[Fail] usaint parsing error" };
    }
};

const getSchedule = async (req, res) => {
    try {
        const page3 = await browser.newPage();
        await page3.setDefaultNavigationTimeout(0);
        await page3.goto("https://saint.ssu.ac.kr/irj/portal", {
            waitUntil: "load",
        });
        await page3.waitForTimeout(1000);
        await page3.waitForSelector(".mob_gnb_list");
        await page3.click(".mob_gnb_list");

        await page3.waitForSelector("#m_ddba4fb5fbc996006194d3c0c0aea5c4");
        await page3.click("#m_ddba4fb5fbc996006194d3c0c0aea5c4");

        await page3.waitForSelector("#m_12cda160608ccd7b32af0ad5c6e5752c");
        await page3.click("#m_12cda160608ccd7b32af0ad5c6e5752c");

        await page3.waitForSelector("#m_1724938fdd5d98311a8647b31efd21fe");
        await page3.click("#m_1724938fdd5d98311a8647b31efd21fe");

        const frame = page3.frames().find((frame) => {
            console.log(frame.name());
            return frame.name() === "contentAreaFrame";
        });

        await frame.waitForTimeout(2000);
        if (frame.name() === "contentAreaFrame") {
            const innerFrames = frame.childFrames();

            let innerFrame = null;

            for (let i = 0; i < innerFrames.length; i++) {
                const title = await innerFrames[i]
                    .title()
                    .then((t) => {
                        console.log(`result :  ` + t);
                        if (t.includes("수업시간표조회")) {
                            innerFrame = innerFrames[i];
                            console.log("innerFrame find!!!!");
                            return t;
                        }
                        return null;
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            }
            if (innerFrame !== null) {
                await innerFrame.waitForTimeout(2000);

                try {
                    const result = await selectSchedule(page3, innerFrame);
                    await frame.waitForTimeout(500);

                    await page3.close();
                    await browser.close();

                    //결과 반환
                    return result;
                } catch (e) {
                    console.log(e);
                }
            }
        } else {
            console.log(frame.name());
            console.log("can not find iframe");
            await page3.close();
            await browser.close();
            return false;
        }
    } catch (error) {
        console.log(error);
        await page3.close();
        await browser.close();
        return false;
    }
};

const years = [
    // { name: "2022", selector: "#WD67" },
    { name: "2021", selector: "#WD66" },
    { name: "2020", selector: "#WD66" },
    // { name: "2019", selector: "#WD64" },
    // { name: "2018", selector: "#WD63" },
];

const semesters = [
    { name: "1학기", selector: "#WD77" },
    { name: "여름학기", selector: "#WD78" },
    { name: "2학기", selector: "#WD79" },
    { name: "겨울학기", selector: "#WD7A" },
];

const selectSchedule = async (page, frame) => {
    console.log("table parsing!!!!!!");
    // page.waitForNavigation();
    // await frame.waitForTimeout(1000);

    const schedules = [];

    //년도 선택
    try {
        for (let y = 0; y < years.length; y++) {
            const yearDown = await frame.waitForSelector(`#WD21-btn`);
            await yearDown.click();
            await page.waitForTimeout(200);

            const yearBtn = await frame.waitForSelector(years[y].selector);
            await yearBtn.click();
            await page.waitForTimeout(200);

            for (let s = 0; s < semesters.length; s++) {
                const semesterDown = await frame.waitForSelector("#WD75-btn");
                await semesterDown.click();
                await page.waitForTimeout(200);

                const semesterBtn = await frame.waitForSelector(
                    semesters[s].selector
                );
                await semesterBtn.click();
                await page.waitForTimeout(1000);

                const html = await frame
                    .content()
                    .then((html) => {
                        return html;
                    })
                    .catch(
                        // 거부 이유 기록
                        function (reason) {
                            console.log(
                                "여기서 거부된 프로미스(" +
                                    reason +
                                    ")를 처리하세요."
                            );
                        }
                    );
                let schedule = {
                    year: "",
                    semester: "",
                    data: [],
                };

                const result = await scheduleParser(html);
                console.log(result);
                schedule.year = years[y].name;
                schedule.semester = semesters[s].name;
                schedule.data = result.isEmpty ? [] : result.schedule;

                schedules.push(schedule);
                console.log(schedules);
            }
        }
        return schedules;
    } catch (e) {
        console.log(e);
    }
};

// id="WD60" => 2015
// id="WD61" => 2016
// id="WD62" => 2017
// id="WD63" => 2018
// id="WD64" => 2019
// id="WD65" => 2020
// id="WD66" => 2021
// id="WD67" => 2022
// id="WD77" => 1학기
// id="WD78" => 여름학기
// id="WD79" => 2학기
// id="WD7A" => 겨울학기

const scheduleParser = async (html) => {
    const $ = cheerio.load(html);
    const table = $("#WD8C-contentTBody");
    console.log("----------------------------table ------------------------");
    var schedule = Array.from(Array(10), () => Array(6).fill(null));

    //TODO IF "#WD8C-contentTBody").html() === null 수강신청자료 없는 것임

    let isEmpty = true;

    $("#WD8C-contentTBody")
        .children("tr")
        .each((index, el) => {
            if (index < 11) {
                const tds = $(el).children("td");
                tds.each((idx, td) => {
                    if (idx !== 0 && !$(td).text().includes("비어 있음")) {
                        isEmpty = false;
                        let item = $(td)
                            .children("span")
                            .children("span:nth-child(2)")
                            .text()
                            .split("\n");

                        let lecture = {
                            name: "",
                            professor: "",
                            time: "",
                            place: "",
                        };
                        if (item.length > 3) {
                            lecture.name = item[0];
                            lecture.professor = item[1];
                            lecture.time = item[2];
                            lecture.place = item[3];

                            schedule[index - 1][idx - 1] = lecture;
                        } else {
                            schedule[index - 1][idx - 1] = $(td)
                                .text()
                                .includes("비어 있음")
                                ? null
                                : $(td).text();
                        }
                    } else if (idx !== 0)
                        schedule[index - 1][idx - 1] = $(td)
                            .text()
                            .includes("비어 있음")
                            ? null
                            : $(td).text();
                });
            }
        });

    const result = [];
    // 첫번째 방법 반복문을 돌면서 바꿔준다

    // 1. 배열의 행 길이만큼 반복한다
    for (let i = 0; i < schedule[0].length; i++) {
        const tmp = [];
        // 2. 배열의 행에서 선택한 열의 값을 추출
        schedule.forEach((row, idx) => tmp.push(row[i]));
        // 3. 추출한 값을 저장
        result.push(tmp);
    }
    return { schedule: result, isEmpty: isEmpty };
};

module.exports = {
    usaintLogin,
    getProfile,
    getSchedule,
    selectSchedule,
};
