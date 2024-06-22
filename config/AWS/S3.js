const AWS = require("aws-sdk");
const multer = require("multer");

AWS.config.update({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  region: process.env.AWS_S3_REGION,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports={AWS,upload}