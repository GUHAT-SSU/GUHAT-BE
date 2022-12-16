const { User } = require("../models");
const { verify, refreshVerify } = require("../utils/jwt-util");
const jwt = require("jsonwebtoken");

const authChecker = async (req, res, next) => {
    if (req.headers.authorization) {
        console.log("이게 문제");
        req.userId = "20203043";
        //req.userId = "20221776";
        next();
    } else {
        console.log("이게 문제2");
        req.userId = "20203043";
        //req.userId = "20221776";
        next();
    }

    // if (req.headers.authorization) {
    //     const token = req.headers.authorization.split("Bearer ")[1];

    //     const decoded = jwt.decode(token);
    //     const user = await User.findOne({ where: { id: decoded.id } });
    //     if (!user) {
    //         return res.status(401).send({
    //             ok: false,
    //             message: "Can not find user",
    //         });
    //     }

    //     const refreshResult = refreshVerify(user.dataValues.token, decoded.id);
    //     if (refreshResult.ok === false) {
    //         return res.status(401).send({
    //             ok: false,
    //             message: "Auth Error from authChecker",
    //         });
    //     } else {
    //         req.userId = decoded.id;
    //         next();
    //     }
    // } else {
    //     res.status(401).json({ error: "Auth Error from authChecker" });
    // }
};

module.exports = { authChecker };
