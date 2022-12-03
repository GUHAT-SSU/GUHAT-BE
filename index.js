const express = require("express");
const cors = require("cors");
const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
const passportConfig = require("./passport/auth");
const { sequelize } = require("./models");

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = 8001;
const app = express();

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const { loadMajor } = require("./db/loadLecture");

// 시퀄라이즈 연결
sequelize
     .sync()
    .then(() => {
        console.log("DB Connected Success");
        loadMajor();
    })
    .catch((err) => {
        console.error(err);
    });



app.use(
    cors({
        origin: true, // ["http://localhost:3000"],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json()); // json 파싱
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
passportConfig();

app.set("port", process.env.PORT || PORT);

// 라우터 정의
app.use("/auth", authRouter);
app.use("/user", userRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.listen(app.get("port"), () => {
    console.log(`Server listening on port ${app.get("port")}...`);
});
