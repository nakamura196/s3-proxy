const express = require("express");
const cors = require("cors");
const AWS = require("aws-sdk");

const app = express();
app.use(cors());

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT,
  region: process.env.AWS_REGION,
});

app.get("/fetch-file", async (req, res) => {
  const { bucket, key } = req.query;

  if (!bucket || !key) {
    return res.status(400).json({ error: "Missing bucket or key" });
  }

  try {
    const params = {
      Bucket: bucket,
      Key: key,
    };

    const data = await s3.getObject(params).promise();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", data.ContentType);
    
    res.send(data.Body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
