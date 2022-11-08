const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
    /*
        static init:
        테이블에 대한 자료형 지정 및 테이블 자체 설정

        static associate:
        테이블과 테이블의 관계에 대한 설정
    */
    static init(sequelize) {
        return super.init(
            {
                //알아서 id 키 값을 생성하고 기본키로 만듬
                studentId: {
                    type: Sequelize.STRING(20),
                    allowNull: false, //NULL 값 허용 여부
                    unique: true, //UNIQUE 여부
                },
                password: {
                    type: Sequelize.STRING(30),
                    allowNull: false,
                },
                token: {
                    type: Sequelize.STRING(400),
                    allowNull: true,
                },
            },
            {
                // 테이블에 대한 설정 지정
                sequelize, // static init의 매개변수와 연결되는 옵션, model/index.js에서 연결
                timestamps: true, // true시 createAt, updateAt 컬럼 추가 각각 생성 및 수정 시 시간 반영
                underscored: false, // 테이블과 컬럼명을 자동으로 캐멀케이스로 만든다.
                modelName: "User", // 프로젝트에서 사용하는 모델의 이름
                tableName: "users", // 실제 데이터베이스의 테이블 이름
                paranoid: false, // true로 설정 시 데이터 삭제 시 완벽하게 삭제하지 않고 삭제기록
                charset: "utf8",
                collate: "utf8_general_ci",
            }
        );
    }
    static associate(db) {
        //테이블과 테이블의 관계를 설정
    }
};
