const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let browser = null;

const authLogin = async (req, res) => {
    const id = req.body.userId;
    const pw = req.body.password;

    // const id = "20201725";
    // const pw = "kimhyomin667~";

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
        let flag = false;
        page.on("dialog", (dialog) => {
            console.log("Dialog is up...");
            delay(1000);
            console.log("Accepted..." + dialog.message());
            //SAP NetWeaver - 로그온 준비 중입니다.
            dialog.accept();
            res.status(400).json({ message: dialog.message() });
            flag = true;
            page.close();
            return;
        });
        await page.waitForNavigation({ timeout: 3000 });
        page.close();
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};

const getProfile = async (req, res) => {
    let result = true;

    const id = req.body.id;
    const pw = req.body.pw;

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
            return res.status(500).json({ message: "잘못된 페이지 접근" });
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
        return res.status(200).json({ entrance });
    } catch (error) {
        console.log(error);
        await page2.close();
        await browser.close();
        return res.status(400).json("parsing error");
    }
};

const toSchedulePage = async (req, res) => {
    try {
        const page3 = await browser.newPage();
        await page3.setDefaultNavigationTimeout(0);
        await page3.goto("https://saint.ssu.ac.kr/irj/portal", {
            waitUntil: "load",
        });
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

        await frame.waitForTimeout(700);
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
                await innerFrame.waitForTimeout(1000);

                try {
                    await getSchedule(page3, innerFrame);
                    await frame.waitForTimeout(500);

                    const html = await innerFrame
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
                    return scheduleParser(html);
                } catch (e) {
                    console.log(e);
                }
            }
        } else {
            console.log(frame.name());
            console.log("can not find iframe");
            return false;
        }
        await page3.close();
        await browser.close();
    } catch (error) {
        console.log(error);
        await page3.close();
        await browser.close();
        return false;
    }
};

const getSchedule = async (page, frame) => {
    console.log("table parsing!!!!!!");
    // page.waitForNavigation();
    // await frame.waitForTimeout(1000);

    //년도 선택
    try {
        const [response] = await Promise.all([
            frame.$eval(`#WD21-btn`, (element) => element.click()),
            frame.$eval(`#WD66`, (element) => element.click()),
        ]).then((res) => {
            console.log(res);
        });
    } catch (e) {
        console.log(e);
    }
    await frame.waitForTimeout(500);
    try {
        await frame.click("#WD75-btn");
        await frame.click(`#WD79`);
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

const scheduleParser = (html) => {
    const $ = cheerio.load(html);
    const table = $("#WD8C-contentTBody");
    console.log("----------------------------table ------------------------");
    var schedule = Array.from(Array(11), () => Array(7).fill(null));

    //TODO IF "#WD8C-contentTBody").html() === null 수강신청자료 없는 것임

    $("#WD8C-contentTBody")
        .children("tr")
        .each((index, el) => {
            if (index < 11) {
                const tds = $(el).children("td");
                tds.each((idx, td) => {
                    schedule[index - 1][idx] = $(td).text();
                });
            }
        });
    console.log(schedule);
    let isEmpty = true;
    for (let i = 0; i < schedule.length; i++) {
        let check = schedule[i].find(
            (element) => element !== null && !element.includes("교시")
        );
        console.log(check);
        if (check) {
            isEmpty = false;
            break;
        }
    }

    return { schedule: schedule, isEmpty: isEmpty };
};

module.exports = {
    authLogin,
    getProfile,
    getSchedule,
    toSchedulePage,
};
