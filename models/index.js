"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const User = require("./user");
const Schedule = require("./schedule");
const Lecture = require("./lecture");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(env, config);
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = User;
db.Schedule = Schedule;
db.Lecture = Lecture;

User.init(sequelize);
Schedule.init(sequelize);
Lecture.init(sequelize);

User.associate(db);
Lecture.associate(db);
Schedule.associate(db);

module.exports = db;
