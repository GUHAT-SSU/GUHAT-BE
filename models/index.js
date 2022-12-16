"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");

const User = require("./user");
const Schedule = require("./schedule");
const Lecture = require("./lecture");
const LecturePost = require("./lecturePost");
const Role = require("./role");
const RoleApplier = require("./roleApplier");
const LectureProject = require("./lectureProject");
const LectureProjectMember = require("./lectureProjectMember");
const MemberReview = require("./memberReview");
const UserProfileImg = require("./userProfileImg");
const Profile = require("./profile");
const ProfileFile = require("./profileFile");
const ProfileLike = require("./proflieLike");
const LectureReview = require("./lectureReview");
const LectureReviewLike = require("./lectureReviewLike");
const LectureReviewFile = require("./lectureReviewFile");

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

const db = {};

let sequelize;
if (config) {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = User;
db.Schedule = Schedule;
db.Lecture = Lecture;
db.LecturePost = LecturePost;
db.Role = Role;
db.RoleApplier = RoleApplier;
db.LectureProject = LectureProject;
db.LectureProjectMember = LectureProjectMember;
db.MemberReview = MemberReview;
db.UserProfileImg = UserProfileImg;
db.Profile = Profile;
db.ProfileFile = ProfileFile;
db.ProfileLike = ProfileLike;
db.LectureReview = LectureReview;
db.LectureReviewLike = LectureReviewLike;
db.LectureReviewFile = LectureReviewFile;

User.init(sequelize);
Schedule.init(sequelize);
Lecture.init(sequelize);
LecturePost.init(sequelize);
Role.init(sequelize);
RoleApplier.init(sequelize);
LectureProject.init(sequelize);
LectureProjectMember.init(sequelize);
MemberReview.init(sequelize);
UserProfileImg.init(sequelize);
Profile.init(sequelize);
ProfileFile.init(sequelize);
ProfileLike.init(sequelize);
LectureReview.init(sequelize);
LectureReviewLike.init(sequelize);
LectureReviewFile.init(sequelize);

User.associate(db);
Lecture.associate(db);
Schedule.associate(db);
LecturePost.associate(db);
Role.associate(db);
RoleApplier.associate(db);
LectureProject.associate(db);
LectureProjectMember.associate(db);
MemberReview.associate(db);
UserProfileImg.associate(db);
Profile.associate(db);
ProfileFile.associate(db);
ProfileLike.associate(db);
LectureReview.associate(db);
LectureReviewLike.associate(db);
LectureReviewFile.associate(db);

module.exports = db;
