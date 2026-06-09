const aws = require("aws-sdk");
const dotenv = require("dotenv");
const crypto = require("crypto");
const {promisify} = require("util");
const randomBytes = promisify(crypto.randomBytes)

dotenv.config()

const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4'
})

async function generateUploadURL(fileName) {
    try {
      const rawBytes = await randomBytes(16);
      const imageName = rawBytes.toString('hex')+fileName;
  
      const params = {
        Bucket: bucketName,
        Key: imageName,
        Expires: 60,
      };
  
      const uploadURL = await s3.getSignedUrlPromise('putObject', params);
      return {
        uploadURL,
        key: imageName,
      };
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw new Error('Could not generate upload URL.');
    }
  }
  
  async function generateDownloadUrl(key) {
    try {
      const downloadParams = {
        Bucket: bucketName,
        Key: key, // Use the same key stored during upload
        Expires: 60 * 60, // Valid for 1 hour
      };

  
      return s3.getSignedUrl('getObject', downloadParams);
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error('Could not generate download URL.');
    }
  }
  

  module.exports = {
    generateDownloadUrl,
    generateUploadURL
};
