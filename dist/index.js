"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const dotenv_1 = __importDefault(require("dotenv"));
const backupService_1 = require("./backupService");
dotenv_1.default.config();
const cronSchedule = process.env.CRON_SCHEDULE || '0 0 * * *';
(0, backupService_1.backupToS3)().catch((error) => console.error('Scheduled backup failed:', error));
node_cron_1.default.schedule(cronSchedule, async () => {
    console.log('Cron job triggered at:', new Date().toISOString());
    (0, backupService_1.backupToS3)().catch((error) => console.error('Scheduled backup failed:', error));
});
console.log('Cron job scheduled.');
//# sourceMappingURL=index.js.map