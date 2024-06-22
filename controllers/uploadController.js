const { AWS } = require("../config/AWS/S3");
// const User = require("../../models/user");
const { v4: uuidv4 } = require("uuid");
const handleApiResponse = require("../utils/responseHandler");
// Upload and Delete integrated
exports.uploadImage = async (req, res) => {
  try {
    if (!req.files ||!Object.keys(req.files)[0]) {
      return handleApiResponse.handleApiError(res,404,"Please upload an image")
    }
    const fieldName = Object.keys(req.files)[0];

    const s3 = new AWS.S3();
    if (fieldName && req.files[fieldName]) {
      const filesArray = req.files[fieldName];
      const uploadPromises = filesArray.map((file) => {
        const userFolder = `store/`;
        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `${userFolder}${fieldName}/${uuidv4()}.jpg`,
          Body: file.buffer,
          // ACL: "public-read",
        };

        return s3.upload(params).promise();
      });

      // Wait for all upload promises to complete
      const uploadResults = await Promise.all(uploadPromises);
      console.log(uploadResults);
      if (uploadResults && uploadResults.length) {
        return handleApiResponse.handleApiSuccess(
          res,
          200,
          "Image uploaded successfully",
          uploadResults[0].Location
        );
      }
    } else {
      return handleApiResponse.handleApiError(
        res,
        400,
        "Failed to add the image"
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return handleApiResponse.handleApiError(
      res,
      500,
      error.message || "Something went wrong"
    );
  }
};
