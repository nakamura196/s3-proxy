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

// 固定のバケット名を環境変数から取得
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'default-bucket-name';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT,
  region: process.env.AWS_REGION,
});

// パスパラメータとしてファイルパスを受け取る
app.get("/*", async (req: Request, res: Response) => {
  // リクエストURLから '/file/' を除いた部分をキーとして使用
  const key = req.path.substring('/'.length);
  
  if (!key) {
    res.status(400).send("ファイルパスが指定されていません");
  }

  s3.getObject({
    Bucket: BUCKET_NAME,
    Key: key,
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
  console.log(`Server is running on port ${PORT}: ${BUCKET_NAME}`);
});
