const passport = require("passport");
const { verify, refreshVerify, sign, refresh } = require("../utils/jwt-util");
const tokenJwt = require("../utils/jwt-util");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const authService = require("../services/authService");
const tokenRefresh = require("../passport/refresh");

module.exports = {
    login: async (req, res, next) => {
        try {
            passport.authenticate("signin", async (err, user, info) => {
                if (err) {
                    console.log("[post]/auth/signin (Error) ", err);
                    return next(err);
                }

                if (info) {
                    console.log("[post]/auth/signin (Fail) ", info);
                    return res.status(401).send(info);
                }

                if (!user) {
                    return res.status(400).json({ message: info.message });
                }

                // id, pw가 맞다면..
                const accessToken = sign(user.studentId, user.password);
                const refreshToken = refresh();

                await authService.updateRefreshToken(
                    user.studentId,
                    refreshToken
                );

                res.status(200).send({
                    // client에게 토큰 모두를 반환합니다.
                    ok: true,
                    message: "login succes",
                    data: {
                        accessToken,
                        refreshToken,
                        user: { studentId: user.studentId },
                        //TODO Response DTO 생성
                    },
                });
            })(req, res, next);
        } catch (error) {
            console.log(error);
            res.json({
                message: error,
            });
        }
    },

    getToken: async (req, res) => {
        const refreshToken = req.body.refeshToken;

        const user = await authService.findUserByToken(req.body.refreshToken);
        if (!user) {
            console.log("[post]/auth/token (Fail) ", "회원정보 없음");
            return res.status(401).send({ message: "회원정보 없음" });
        } else {
            //refresh token 검증
            const refreshResult = refreshVerify(
                refreshToken,
                user.dataValues.studentId
            );
            //refresh token 만료됨 -> 새로운 로그인
            if (refreshResult.ok === false) {
                return res.status(401).send({
                    ok: false,
                    message: "No authorized!",
                });
            } else {
                //accessToken 재발급
                const newAccessToken = sign(user.dataValues.studentId);
                return res.status(200).send({
                    // 새로 발급한 access token과 원래 있던 refresh token 모두 클라이언트에게 반환합니다.
                    ok: true,
                    message: "succes to refresh access_token",
                    data: {
                        accessToken: newAccessToken,
                        refreshToken: refreshToken,
                    },
                });
            }
        }
    },

    refresh: async (req, res, next) => {
        await tokenRefresh.refeshToken(req, res);
    },
};
