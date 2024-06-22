const { v4: uuidv4 } = require("uuid");
const path = require("path");

const multer = require("multer");
const multerS3 = require("multer-s3");

const { s3Client } = require("../config/AWS/S3");

const maxSize = 5242880; // 5 MB

module.exports = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    serverSideEncryption: "AES256",
    // acl: "public-read",
    contentDisposition: "inline",
    contentType: multerS3.AUTO_CONTENT_TYPE,
      key(req, file, cb) {
        console.log(req)
      let dtn = "";
      let documentType = "";
      if (req.body.dtn) {
        dtn = req.body.dtn;
      }
      if (req.body.documentType) {
        documentType = req.body.documentType.split(" ").join("_");
        documentType = documentType.replace(/[^\w-]/g, "");
      }
      const filetypes = /jpeg|jpg|png|pdf|webp|csv/;
      const mimetype = filetypes.test(file.mimetype);
      if (mimetype) {
        const fileName = `${
          (file.fieldname ? `${file.fieldname}/` : "") +
          (dtn === "" ? "" : `${dtn}_`) +
          (documentType === "" ? "" : `${documentType}_`) +
          uuidv4()
        }.${path.extname(file.originalname)}`;
        cb(null, fileName);
      } else {
          console.log("entered")
        return cb(
          new Error(
            "Sorry, we only accepts the following file formats: PNG, JPG/JPEG/WEBP, and PDF."
          )
        );
      }
    },
  }),
  limits: { fileSize: maxSize },
});
