const { User, Schedule } = require("../models");

module.exports = {
    findUserById: async (id) => {
        return await User.findOne({ where: { id: id } })
            .then((res) => res.dataValues)
            .catch((error) => console.log(error));
    },
};
