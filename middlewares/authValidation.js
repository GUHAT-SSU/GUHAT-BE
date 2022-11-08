const { User } = require("../models");
const { verify, refreshVerify } = require("../utils/jwt-util");
const jwt = require("jsonwebtoken");

const authChecker = async (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split("Bearer ")[1];

        // const authResult = verify(token, process.env.JWT_SECRET_KEY, (err) => {
        //     if (err) {
        //         res.status(401).json({ error: "Auth Error from authChecker" });
        //     } else {
        //         next();
        //     }
        // });
        const decoded = jwt.decode(token);
        const user = await User.findOne({ where: { studentId: decoded.id } });
        if (!user) {
            return res.status(401).send({
                ok: false,
                message: "Can not find user",
            });
        }

        const refreshResult = refreshVerify(user.dataValues.token, decoded.id);
        if (refreshResult.ok === false) {
            return res.status(401).send({
                ok: false,
                message: "Auth Error from authChecker",
            });
        } else {
            next();
        }
    } else {
        res.status(401).json({ error: "Auth Error from authChecker" });
    }
};

module.exports = { authChecker };
