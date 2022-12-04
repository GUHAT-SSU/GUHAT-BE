const { DataTypes } = require("sequelize");
const Sequelize = require("sequelize");

module.exports = class Schedule extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                year: {
                    type: Sequelize.STRING(10),
                    allowNull: false,
                },
                semester: {
                    type: Sequelize.STRING(20),
                    allowNull: false,
                },
                name: {
                    type: Sequelize.STRING(200),
                    allowNull: false,
                },
                professor: {
                    type: Sequelize.STRING(30),
                    allowNull: true,
                },
                day: {
                    type: Sequelize.STRING(10),
                    allowNull: true,
                },
                time: {
                    type: Sequelize.STRING(30),
                    allowNull: true,
                },
                place: {
                    type: Sequelize.STRING(50),
                    allowNull: true,
                },
            },
            {
                sequelize,
                timestamps: true,
                underscored: false,
                modelName: "Schedule",
                tableName: "schedules",
                paranoid: true,
                charset: "utf8",
                collate: "utf8_general_ci",
            }
        );
    }
    static associate(db) {
        db.User.hasMany(db.Schedule, {
            foreignKey: { name: "user_id", type: DataTypes.STRING },
            sourceKey: "id",
            paranoid: true,
        });
        db.Schedule.belongsTo(db.Lecture, {
            foreignKey: "lecture_id",
            sourceKey: "id",
        });
    }
};
