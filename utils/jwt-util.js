const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = {
    sign: (studentId) => {
        // access token 발급
        const payload = {
            // access token에 들어갈 payload
            id: studentId,
        };

        return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            // secret으로 sign하여 발급하고 return
            algorithm: "HS256", // 암호화 알고리즘
            expiresIn: "1h", // 유효기간
        });
    },
    verify: (token) => {
        // access token 검증
        let decoded = null;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            return {
                ok: true,
                id: decoded.studentId,
                password: decoded.password,
            };
        } catch (err) {
            return {
                ok: false,
                message: err.message,
            };
        }
    },
    refresh: () => {
        // refresh token 발급
        return jwt.sign({}, process.env.JWT_SECRET_KEY, {
            // refresh token은 payload 없이 발급
            algorithm: "HS256",
            expiresIn: "2h",
        });
    },
    refreshVerify: async (token, studentId) => {
        // // refresh token 검증
        // /* redis 모듈은 기본적으로 promise를 반환하지 않으므로,
        //  promisify를 이용하여 promise를 반환하게 해줍니다.*/
        // const getAsync = promisify(redisClient.get).bind(redisClient);
        const user = await User.findOne({
            where: { studentId: studentId },
        }).then((_user) => {
            return _user;
        });
        if (!user) return false;

        try {
            const data = user.dataValues.token; // refresh token 가져오기
            if (token === data) {
                try {
                    jwt.verify(token, secret);
                    return true;
                } catch (err) {
                    return false;
                }
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    },
};
