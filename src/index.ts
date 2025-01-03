import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const cronSchedule = process.env.CRON_SCHEDULE || '0 0 * * *';

console.log('Starting cron job for database backup.');

cron.schedule(cronSchedule, async () => {
  console.log('Cron job triggered at:', new Date().toISOString());
//   await uploadToS3();
});

console.log('Cron job scheduled.');