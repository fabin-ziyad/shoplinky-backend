const { S3 } = require('aws-sdk');

const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY_ID, 
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.ENDPOINT
});


const uploadFile = async (fileName, fileBuffer) => {
    try {
        const response = await s3.upload({
            Body: fileBuffer,
            Bucket: "shoplinky",
            Key: fileName,
        }).promise();

        return response; 
    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
};

module.exports = { uploadFile };