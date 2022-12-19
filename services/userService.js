const { User, Schedule, Profile } = require("../models");
const UserProfileImg = require("../models/userProfileImg");

module.exports = {
    findUserById: async (id) => {
        try {
            return await User.findOne({
                where: { id: id },
                include: [
                    {
                        model: UserProfileImg,
                        required: false,
                        where: { user_id: id },
                    },
                ],
            }).then((res) => {
                if (res) return res.dataValues;
                else res;
            });
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    },

    getUserInfo: async (id) => {
        return await User.findOne({
            where: { id: id },
            include: [
                {
                    model: UserProfileImg,
                    require: false,
                    where: { user_id: id },
                },
                {
                    model: Profile,
                    require: false,
                    where: { user_id: id },
                },
            ],
        })
            .then((res) => {
                if (res)
                    return {
                        id: res.dataValues.id,
                        nickname: res.dataValues.nickname,
                        level: res.dataValues.level,
                        profileImg: res.dataValues.UserProfileImg.file,
                        profile: {
                            id: res.dataValues?.Profile.id,
                            mode: res.dataValues?.Profile.mode,
                        },
                    };
                return res;
            })
            .catch((error) => console.log(error));
    },

    updateUserInfoById: async (id, nickname, profileImg) => {
        try {
            if (profileImg !== null) {
                await UserProfileImg.findOrCreate({
                    where: { user_id: id },
                    defulats: {
                        file: profileImg,
                    },
                });
                return await UserProfileImg.update(
                    { file: profileImg },
                    { where: { user_id: id } }
                );
            }
            return await User.update({ nickname }, { where: { id: id } });
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    },
};
