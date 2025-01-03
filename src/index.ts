import cron from 'node-cron';
import dotenv from 'dotenv';
import { backupToS3 } from './backupService';

dotenv.config();

const cronSchedule = process.env.CRON_SCHEDULE || '0 0 * * *';

// backupToS3().catch((error) => console.error('Scheduled backup failed:', error));

cron.schedule(cronSchedule, async () => {
  console.log('Cron job triggered at:', new Date().toISOString());
  backupToS3().catch((error) => console.error('Scheduled backup failed:', error));
});

console.log('Cron job scheduled.');