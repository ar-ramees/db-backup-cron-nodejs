import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { exec } from 'child_process';
import fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { promisify } from 'util';

dotenv.config();

// Promisify exec for async/await
const execAsync = promisify(exec);

// Load environment variables
const {
  PG_USER,
  PG_HOST,
  PG_PORT,
  PG_DB,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET_NAME,
} = process.env;

if (!PG_USER || !PG_HOST || !PG_DB || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_BUCKET_NAME) {
  throw new Error('Missing required environment variables');
}


// Configure S3 client
const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  export const backupToS3 = async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.sql.gz`;
    const backupFilePath = path.join(__dirname, backupFileName);
  
    try {
      // Step 1: Create a PostgreSQL backup using pg_dump
      const command = `pg_dump -U ${PG_USER} -h ${PG_HOST} -p ${PG_PORT} ${PG_DB} | gzip > ${backupFilePath}`;
      console.log('Creating database backup...');
      await execAsync(command);
      console.log(`Backup created successfully: ${backupFilePath}`);
  
      // Step 2: Upload the backup to S3
      const fileStream = fs.createReadStream(backupFilePath);
      const uploadParams = {
        Bucket: AWS_S3_BUCKET_NAME!,
        Key: `backups/${backupFileName}`,
        Body: fileStream,
      };
  
      console.log('Uploading backup to S3...');
      const commandToUpload = new PutObjectCommand(uploadParams);
      await s3.send(commandToUpload);
      console.log('Backup uploaded to S3 successfully.');
  
      // Step 3: Clean up local backup file
      fs.unlinkSync(backupFilePath);
      console.log('Local backup file deleted.');
    } catch (error) {
      console.error('Error during backup or upload:', error);
      throw error;
    }
  };
  