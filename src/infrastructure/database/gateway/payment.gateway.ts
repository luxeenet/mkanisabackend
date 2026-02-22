import axios from 'axios';
import { config } from '@config/index';
import { logger } from '@services/logger';

export interface IPaymentPayload {
    amount: number;
    phone: string;
    reference: string;
    type: 'SADAKA' | 'SUBSCRIPTION' | 'DONATION';
}

export class PaymentGateway {
    static async initiateMpesaSTK(payload: IPaymentPayload) {
        logger.info(`Initiating M-Pesa STK Push for ${payload.phone} - Amount: ${payload.amount}`);

        // This is a placeholder for actual Vodacom M-Pesa API integration
        // Example: const response = await axios.post(config.mpesa.url, { ... });

        return {
            status: 'PENDING',
            transactionId: 'MPESA-' + Math.random().toString(36).substr(2, 9),
            message: 'STK Push sent to customer phone'
        };
    }

    static async initiateAirtelMoney(payload: IPaymentPayload) {
        logger.info(`Initiating Airtel Money Payment for ${payload.phone}`);
        return {
            status: 'PENDING',
            transactionId: 'AIRTEL-' + Math.random().toString(36).substr(2, 9),
        };
    }
}
