const Sequelize = require("sequelize");
const { DataTypes } = require("sequelize");

module.exports = class Role extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                name: {
                    type: Sequelize.STRING(50),
                    allowNull: false,
                    comment: "그룹 이름"
                }, 
                max: {
                    type: Sequelize.INTEGER(20), // 일단 string으로 저장,,
                    allowNull: false,
                    comment: "전체허용인원"
                },
            },
            {
                // 테이블에 대한 설정 지정
                sequelize, // static init의 매개변수와 연결되는 옵션, model/index.js에서 연결
                timestamps: true, // true시 createAt, updateAt 컬럼 추가 각각 생성 및 수정 시 시간 반영
                underscored: false, // 테이블과 컬럼명을 자동으로 캐멀케이스로 만든다.
                modelName: "Role", // 프로젝트에서 사용하는 모델의 이름
                tableName: "roles", // 실제 데이터베이스의 테이블 이름
                paranoid: true, // true로 설정 시 데이터 삭제 시 완벽하게 삭제하지 않고 삭제기록
                charset: "utf8",
                collate: "utf8_general_ci",
            }
        );
    }
    static associate(db) {
        db.LecturePost.hasMany(db.Role, {
            foreignKey: {name: "lecturePost_id"},
            sourceKey: "id",
            paranoid: true,
        });
    }
};
