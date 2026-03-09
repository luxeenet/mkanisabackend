import { Queue, Worker } from 'bullmq';
import { config } from '@config/index';
import { logger } from '@services/logger';
import { MmojaClient } from '@infrastructure/external/mmoja.client';

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

// Worker Implementation
export const smsWorker = new Worker('sms-queue', async (job) => {
    const { phone, message, churchId } = job.data;
    logger.info(`Sending SMS via Mmoja to ${phone}: ${message}`);

    try {
        const result = await MmojaClient.sendSms(phone, message);
        if (result.status === 'S') {
            logger.info(`SMS sent successfully to ${phone}. ID: ${result.message_id}`);
            return { success: true, messageId: result.message_id };
        } else {
            logger.error(`Mmoja SMS fail for ${phone}: ${result.remarks}`);
            throw new Error(`Mmoja SMS failed: ${result.remarks}`);
        }
    } catch (err: any) {
        logger.error(`SMS Worker Error: ${err.message}`);
        throw err; // Re-throw to allow BullMQ to retry based on job config
    }
}, redisConfig);
