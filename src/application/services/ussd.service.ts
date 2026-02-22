import db from '@infrastructure/database/knex';
import { logger } from '@services/logger';

export class UssdService {
    async handleRequest(sessionId: string, phoneNumber: string, text: string) {
        const parts = text.split('*');
        const level = text === '' ? 0 : parts.length;

        // 1. Get or Create Session
        let session = await db('ussd_sessions').where({ session_id: sessionId }).first();
        if (!session) {
            [session] = await db('ussd_sessions').insert({
                session_id: sessionId,
                phone_number: phoneNumber,
                current_menu: 'MAIN'
            }).returning('*');
        }

        let response = '';

        // Logical Menu Flow
        if (text === '') {
            response = "CON Karibu M-KANISA platform.\n";
            response += "Chagua huduma:\n";
            response += "1. Lipa Sadaka/Zaka\n";
            response += "2. Lipia Subscription\n";
            response += "3. Matoleo ya Mkutano\n";
            response += "4. Ahadi/Donation Maalum";
        } else if (parts[0] === '1') {
            response = await this.handlePaymentFlow(parts, phoneNumber, 'SADAKA');
        } else if (parts[0] === '2') {
            response = await this.handleSubscriptionFlow(parts, phoneNumber);
        } else if (parts[0] === '3') {
            response = await this.handlePaymentFlow(parts, phoneNumber, 'CONFERENCE');
        } else if (parts[0] === '4') {
            response = await this.handlePaymentFlow(parts, phoneNumber, 'SPECIAL');
        } else {
            response = "END Huduma haijapatikana. Asante.";
        }

        return response;
    }

    private async handlePaymentFlow(parts: string[], phone: string, type: string) {
        if (parts.length === 1) {
            return "CON Weka kiasi (Amount):";
        } else if (parts.length === 2) {
            return "CON Weka Namba ya Kanisa (Church ID):";
        } else if (parts.length === 3) {
            const amount = parts[1];
            const churchSlug = parts[2];

            // Generate Payment prompt via external Fintech API stub
            logger.info(`USSD Payment Triggered: ${phone} paying ${amount} to ${churchSlug} for ${type}`);

            return `END Ombi la TZS ${amount} limepokelewa. Fungua simu yako kuweka PIN kukamilisha malipo kwa ${churchSlug}.`;
        }
        return "END Error ocurred.";
    }

    private async handleSubscriptionFlow(parts: string[], phone: string) {
        if (parts.length === 1) {
            return "CON Chagua Plan:\n1. Monthly (1k)\n2. Annual (12k)";
        } else if (parts.length === 2) {
            const plan = parts[1] === '1' ? 'MONTHLY' : 'ANNUAL';
            const price = parts[1] === '1' ? '1,000' : '12,000';
            return `END Ombi la kulipia ${plan} (TZS ${price}) limepokelewa. Weka PIN kwenye simu yako.`;
        }
        return "END Error ocurred.";
    }
}
