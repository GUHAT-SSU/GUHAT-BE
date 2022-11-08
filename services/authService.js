const { User } = require("../models");
const passport = require("passport");
const jwt = require("../utils/jwt-util");

module.exports = {
    createUser: async (id, password) => {
        return User.create({
            studentId: id,
            password: password,
        })
            .then((newUser) => {
                return newUser;
            })
            .catch((e) => {
                console.log("create user error..." + e);
            });
    },

    findUserByStudentId: async (studentId) => {
        return await User.findOne({
            where: { studentId: studentId },
        }).then((_user) => {
            return _user;
        });
    },

    findUserByToken: async (refreshToken) => {
        console.log("find with token");
        console.log(refreshToken);
        return await User.findOne({
            where: { token: refreshToken },
        }).catch((error) => {
            console.log(error);
        });
    },

    updateRefreshToken: async (studentId, refreshToken) => {
        await User.findOne({
            where: { studentId: studentId },
        }).then((user) => {
            if (user) {
                user.update({ token: refreshToken });
            }
        });
    },
};
