import axios from 'axios';
import { config } from '@config/index';
import { logger } from '@services/logger';

export interface MmojaSmsResponse {
    message_id: number;
    status: 'S' | 'F';
    remarks: string;
    uid?: string;
}

export interface MmojaBalanceResponse {
    BalanceAmount: string;
    CurrenceCode: string;
}

export class MmojaClient {
    private static baseUrl = config.mmoja.apiUrl;
    private static apiId = config.mmoja.apiId;
    private static apiPassword = config.mmoja.apiPassword;
    private static senderId = config.mmoja.senderId;

    static async sendSms(phoneNumber: string, message: string, uid?: string): Promise<MmojaSmsResponse> {
        try {
            const response = await axios.post(`${this.baseUrl}/SendSMS`, {
                api_id: this.apiId,
                api_password: this.apiPassword,
                sms_type: 'T', // Transactional
                encoding: 'T', // Text
                sender_id: this.senderId,
                phonenumber: this.cleanPhoneNumber(phoneNumber),
                textmessage: message,
                uid: uid
            });

            return response.data;
        } catch (error: any) {
            logger.error(`Mmoja Send SMS Error: ${error.message}`);
            throw new Error('Failed to send SMS via Mmoja');
        }
    }

    static async sendSmsMulti(phoneNumbers: string[], message: string): Promise<any> {
        try {
            const response = await axios.get(`${this.baseUrl}/SendSMSMulti`, {
                params: {
                    api_id: this.apiId,
                    api_password: this.apiPassword,
                    sms_type: 'T',
                    encoding: 'T',
                    sender_id: this.senderId,
                    phonenumber: phoneNumbers.map(p => this.cleanPhoneNumber(p)).join(','),
                    textmessage: message
                }
            });

            return response.data;
        } catch (error: any) {
            logger.error(`Mmoja Send Multi SMS Error: ${error.message}`);
            throw new Error('Failed to send bulk SMS via Mmoja');
        }
    }

    static async checkBalance(): Promise<MmojaBalanceResponse> {
        try {
            const response = await axios.post(`${this.baseUrl}/CheckBalance`, {
                api_id: this.apiId,
                api_password: this.apiPassword
            });

            return response.data;
        } catch (error: any) {
            logger.error(`Mmoja Check Balance Error: ${error.message}`);
            throw new Error('Failed to check Mmoja balance');
        }
    }

    static async getDeliveryStatus(messageId: number): Promise<any> {
        try {
            const response = await axios.post(`${this.baseUrl}/GetDeliveryStatus`, {
                api_id: this.apiId,
                api_password: this.apiPassword,
                message_id: messageId
            });

            return response.data;
        } catch (error: any) {
            logger.error(`Mmoja Get Delivery Status Error: ${error.message}`);
            throw new Error('Failed to get SMS delivery status');
        }
    }

    private static cleanPhoneNumber(phone: string): string {
        // Remove + sign and any non-digit characters
        return phone.replace(/\D/g, '');
    }
}
