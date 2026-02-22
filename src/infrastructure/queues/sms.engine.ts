import { Queue, Worker } from 'bullmq';
import { config } from '@config/index';
import { logger } from '@services/logger';

const redisConfig = {
    connection: {
        url: config.redis.url
    }
};

export const smsQueue = new Queue('sms-queue', redisConfig);

export class SmsEngine {
    static async scheduleSms(payload: { phone: string; message: string; churchId: string }) {
        await smsQueue.add('send-sms', payload, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
        logger.info(`SMS queued for ${payload.phone}`);
    }
}

// Worker Implementation (usually in a separate process/file)
export const smsWorker = new Worker('sms-queue', async (job) => {
    const { phone, message, churchId } = job.data;
    logger.info(`Sending SMS to ${phone}: ${message}`);

    // Implementation of Telco API (M-Pesa, Airtel, etc.) goes here
    // await axios.post(provider_url, { recipient: phone, text: message });

    return { success: true };
}, redisConfig);
