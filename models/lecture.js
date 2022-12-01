const Sequelize = require("sequelize");
const { DataTypes } = require("sequelize");

module.exports = class Lecture extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                code: {
                    type: Sequelize.STRING(10),
                    allowNull: false,
                }, //과목 코드
                year: {
                    type: Sequelize.STRING(10),
                    allowNull: false,
                },
                semester: {
                    type: Sequelize.STRING(20),
                    allowNull: false,
                },
                univ: {
                    type: Sequelize.STRING(30),
                    allowNull: true,
                },
                major: {
                    type: Sequelize.STRING(40),
                    allowNull: true,
                },
                major_detail: {
                    type: Sequelize.STRING(40),
                    allowNull: true,
                }, //세부전공

                name: {
                    type: Sequelize.STRING(200),
                    allowNull: false,
                },
                group: {
                    type: Sequelize.STRING(100),
                    allowNull: true,
                }, //분반
                professor: {
                    type: Sequelize.JSON,
                    allowNull: true,
                }, //교수님 ["권해생"]
                target: {
                    type: Sequelize.JSON,
                    allowNull: true,
                }, //수강대상 ["4학년 기독교"]
                schedule: {
                    type: Sequelize.JSON,
                    allowNull: true,
                }, //시간
                /*                   
                    schedule: [
                    {
                        "day": ["목"],
                        "time": "10:30-11:45",
                        "place": "(조만식기념관 12533-1-권해생)"
                    },
                    {
                        "day": ["금"],
                        "time": "13:30-14:45",
                        "place": "(미래관 20403-권해생)"
                    }
                    ], 
                */
            },
            {
                // 테이블에 대한 설정 지정
                sequelize, // static init의 매개변수와 연결되는 옵션, model/index.js에서 연결
                timestamps: true, // true시 createAt, updateAt 컬럼 추가 각각 생성 및 수정 시 시간 반영
                underscored: false, // 테이블과 컬럼명을 자동으로 캐멀케이스로 만든다.
                modelName: "Lecture", // 프로젝트에서 사용하는 모델의 이름
                tableName: "lectures", // 실제 데이터베이스의 테이블 이름
                paranoid: true, // true로 설정 시 데이터 삭제 시 완벽하게 삭제하지 않고 삭제기록
                charset: "utf8",
                collate: "utf8_general_ci",
            }
        );
    }
    static associate(db) {
        db.Lecture.hasMany(db.Schedule, {
            foreignKey: "lecture_id",
            sourceKey: "id",
        });
    }
};
