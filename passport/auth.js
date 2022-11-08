require("dotenv").config();

const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const { ExtractJwt, Strategy: JWTStrategy } = require("passport-jwt");
const authService = require("../services/authService");
const { sign, verify, refreshVerify } = require("../utils/jwt-util");
const jwt = require("jsonwebtoken");

// 토큰에 담길 유저명의 key를 지정하는 옵션. 패스워드도 지정할 수 있다.
const passportConfig = { usernameField: "userId", passwordField: "password" };
const passportVerify = async (userId, password, done) => {
    // 유저가 db 에 존재한다면
    let user = await authService.findUserByStudentId(userId);
    if (user) return done(null, user.dataValues);
    else {
        // 유저 db 등록
        let newUser = await authService
            .createUser(userId, password)
            .then((res) => {
                return res;
            })
            .catch((e) => {
                console.log(e);
                return done(null, false, { message: "sign in error" });
            });
        return done(null, newUser.dataValues);
    }
};

module.exports = () => {
    passport.use(
        "signup",
        new localStrategy(passportConfig, async (userId, password, done) => {
            // 유저 생성
            // 성공하면
            let user = await authService.findUserByStudentId(userId);
            if (user) return done(null, userId);

            // 실패하면
            return done(null, false, { message: "User creation fail." });
        })
    );

    passport.use("signin", new localStrategy(passportConfig, passportVerify));
};
