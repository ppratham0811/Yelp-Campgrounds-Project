const aws = require("aws-sdk");
const { S3 } = require("aws-sdk");
const uuid = require("uuid").v4;
const s3 = new S3();

aws.config.update({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

module.exports.s3Upload = async (files) => {
  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `uploads/${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };
  });

  return await Promise.all(params.map((param) => s3.upload(param).promise()));
};

module.exports.s3Delete = async (filename) => {
  const deleteParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `uploads/${filename}`,
  };
  await s3.deleteObject(deleteParams).promise();
  return;
};
