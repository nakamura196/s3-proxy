import express, { Request, Response } from "express";
import cors from "cors";
import AWS from "aws-sdk";

// 開発環境では.envを使用 (本番環境のVercelでは不要)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4000;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT,
  region: process.env.AWS_REGION,
});


app.get("/fetch-file", async (req: Request, res: Response) => {
  
  const { bucket, key } = req.query;

  if (!bucket || !key) {
    res.send("Missing bucket or key");
  }

  s3.getObject({
    Bucket: bucket as string,
    Key: key as string,
  }).promise()
    .then(data => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", data.ContentType || 'application/octet-stream');
      res.send(data.Body);
    })
    .catch(error => {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      res.status(500).json({ error: errorMessage });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
