const { S3 } = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { AUTO_CONTENT_TYPE } = require("multer-s3");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const prefix = process.env.AWS_PREFIX;

const s3 = new S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region,
});

const upload = (file_dir) =>
    multer({
        storage: multerS3({
            s3: s3,
            bucket: bucketName,
            contentType: AUTO_CONTENT_TYPE,
            acl: "public-read",
            key: (req, file, cb) => {
                cb(null, `${file_dir}/${Date.now()}_${file.originalname}`);
            },
        }),
    });

const delete_file = (url) => {
    let params = {
        Bucket: bucketName,
        Key: url.replace(prefix, ""), //앞 주소 제거
    };

    try {
        s3.deleteObject(params, function (error, data) {
            if (error) {
                console.log("err: ", error, error.stack);
            } else {
                console.log(data, " 정상 삭제 되었습니다.");
            }
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
};

module.exports = { upload, delete_file, s3 };
