"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
// 開発環境では.envを使用 (本番環境のVercelでは不要)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const PORT = process.env.PORT || 4000;
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_ENDPOINT,
    region: process.env.AWS_REGION,
});
app.get("/fetch-file", async (req, res) => {
    const { bucket, key } = req.query;
    if (!bucket || !key) {
        res.send("Missing bucket or key");
    }
    s3.getObject({
        Bucket: bucket,
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
    console.log(`Server is running on port ${PORT}`);
});
