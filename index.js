const express = require("express");
const cors = require("cors");
const { loadMajor } = require("./db/loadLecture");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
const { sequelize } = require("./models");

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = 8001;
const app = express();

const userRouter = require("./routes/user");
const postRouter = require("./routes/posting");
const homeRouter = require("./routes/home");
const profileRouter = require("./routes/profile");
const lectureRouter = require("./routes/lecture");

// 시퀄라이즈 연결
sequelize
    .sync()
    .then(() => {
        console.log("DB Connected Success");
        // loadMajor();
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

app.set("port", process.env.PORT || PORT);

app.use("/user", userRouter);
app.use("/posting", postRouter);
app.use("/home", homeRouter);
app.use('/profile', profileRouter);
app.use('/lecture', lectureRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.listen(app.get("port"), () => {
    console.log(`Server listening on port ${app.get("port")}...`);
});