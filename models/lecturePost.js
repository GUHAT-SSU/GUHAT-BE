const Sequelize = require("sequelize");
const { DataTypes } = require("sequelize");

module.exports = class LecturePost extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                title: {
                    type: Sequelize.STRING(50),
                    allowNull: false,
                    comment: "제목",
                },
                endDate: {
                    type: Sequelize.DATEONLY(20), // YYYY-MM-DD
                    allowNull: false,
                    comment: "마감기한",
                },
                detail: {
                    type: Sequelize.STRING(500),
                    allowNull: false,
                    comment: "상세설명",
                },
                priority: {
                    type: Sequelize.STRING(200),
                    allowNull: true,
                    comment: "우대사항",
                },
                chatLink: {
                    type: Sequelize.STRING(1000),
                    allowNull: true,
                    comment: "채팅링크",
                },
                viewCnt: {
                    type: Sequelize.INTEGER(100),
                    allowNull: true,
                    defaultValue: 0,
                    comment: "조회수",
                },
                status: {
                    type: Sequelize.STRING(10),
                    allowNull: false,
                    defaultValue: "open", // open / close
                    comment: "마감여부현황",
                },
                period: {
                    type: Sequelize.STRING(30),
                    allowNull: false,
                    comment: "예상기간",
                },
            },
            {
                // 테이블에 대한 설정 지정
                sequelize, // static init의 매개변수와 연결되는 옵션, model/index.js에서 연결
                timestamps: true, // true시 createAt, updateAt 컬럼 추가 각각 생성 및 수정 시 시간 반영
                underscored: false, // 테이블과 컬럼명을 자동으로 캐멀케이스로 만든다.
                modelName: "LecturePost", // 프로젝트에서 사용하는 모델의 이름
                tableName: "lecturePosts", // 실제 데이터베이스의 테이블 이름
                paranoid: true, // true로 설정 시 데이터 삭제 시 완벽하게 삭제하지 않고 삭제기록
                charset: "utf8",
                collate: "utf8_general_ci",
            }
        );
    }
    static associate(db) {
        db.User.hasMany(db.LecturePost, {
            foreignKey: { name: "writer_id", type: DataTypes.STRING },
            sourceKey: "id",
            paranoid: true,
        });
        db.Lecture.hasMany(db.LecturePost, {
            foreignKey: { name: "lecture_id" },
            sourceKey: "id",
        });
    }
};
