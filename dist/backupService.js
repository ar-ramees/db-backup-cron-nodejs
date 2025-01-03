"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const util_1 = require("util");
dotenv_1.default.config();
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const { PG_USER, PG_HOST, PG_PORT, PG_DB, PGPASSWORD, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME, } = process.env;
if (!PG_USER || !PG_HOST || !PG_DB || !PGPASSWORD || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !S3_BUCKET_NAME) {
    throw new Error('Missing required environment variables');
}
const s3 = new client_s3_1.S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});
const backupToS3 = async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.sql.gz`;
    try {
        const command = `pg_dump -U ${PG_USER} -h ${PG_HOST} -p ${PG_PORT} ${PG_DB} | gzip > ${backupFileName}`;
        console.log('Creating database backup...');
        await execAsync(command);
        console.log(`Backup created successfully: ${backupFileName}`);
        const fileStream = fs_1.default.createReadStream(backupFileName);
        const uploadParams = {
            Bucket: S3_BUCKET_NAME,
            Key: `${backupFileName}`,
            Body: fileStream,
        };
        console.log('Uploading backup to S3...');
        const commandToUpload = new client_s3_1.PutObjectCommand(uploadParams);
        await s3.send(commandToUpload);
        console.log('Backup uploaded to S3 successfully.');
        fs_1.default.unlinkSync(backupFileName);
        console.log('Local backup file deleted.');
    }
    catch (error) {
        console.error('Error during backup or upload:', error);
        throw error;
    }
};
exports.backupToS3 = backupToS3;
//# sourceMappingURL=backupService.js.map