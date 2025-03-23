# s3-proxy

mdx I のオブジェクトストレージに対するプロキシサーバの構築についてのリポジトリです。

## 背景

mdx I のオブジェクトストレージ (DDN EXAScaler S3 Data Service) は CORS (Cross-Origin Resource Sharing) をサポートしていません。そのため、ウェブブラウザ上の JavaScript などから直接アクセスすると、クロスオリジン制約によりリクエストがブロックされます。

この問題を回避するために、プロキシサーバを構築し、クライアントからのリクエストを一旦受け取り、サーバ側で API にアクセスすることで CORS を解決します。

## デプロイ済みプロキシ

デプロイされたプロキシサーバを使用して、以下のようにバケット上のファイルにアクセスできます。

```
https://s3-proxy.vercel.app/public/CETEIcean.css
```

一方、直接アクセスすると CORS による制約が発生する可能性があります。

```
https://s3ds.mdx.jp/satoru196/public/CETEIcean.css
```

## 実装

このプロキシサーバは Express を用いて構築されており、AWS SDK を利用して S3 互換のストレージにアクセスします。

### 使用技術

- Node.js
- Express
- AWS SDK (v2, v3 に移行予定)
- Vercel (ホスティング)

### コード例

```ts
import express, { Request, Response } from "express";
import cors from "cors";
import AWS from "aws-sdk";

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4000;
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'default-bucket-name';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT,
  region: process.env.AWS_REGION,
});

app.get("/*", async (req: Request, res: Response) => {
  const key = req.path.substring(1);
  if (!key) {
    return res.status(400).send("ファイルパスが指定されていません");
  }
  
  try {
    const data = await s3.getObject({
      Bucket: BUCKET_NAME,
      Key: key,
    }).promise();
    
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", data.ContentType || 'application/octet-stream');
    res.send(data.Body);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : '不明なエラーが発生しました' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}: ${BUCKET_NAME}`);
});
```

## 使い方

### 環境変数の設定

プロジェクトのルートディレクトリに `.env` ファイルを作成し、以下の環境変数を設定してください。

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_ENDPOINT=https://s3ds.mdx.jp
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
PORT=4000
```

### ローカル環境での実行

```
npm install
npm run start
```

### Vercel へのデプロイ

```
vercel deploy
```

## 注意点

- `AWS SDK for JavaScript v3` への移行を検討中
- Vercel の環境変数設定を適切に行うこと

## ライセンス

MIT License

