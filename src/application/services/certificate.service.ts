import PDFDocument from 'pdfkit';
import { logger } from '@services/logger';
import fs from 'fs';
import path from 'path';

export class CertificateGenerator {
    static async generate(data: { memberName: string; churchName: string; type: string; date: string }) {
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
        const fileName = `certificate_${Date.now()}.pdf`;
        const filePath = path.join(process.cwd(), 'uploads', fileName);

        // Ensure uploads directory exists
        if (!fs.existsSync(path.join(process.cwd(), 'uploads'))) {
            fs.mkdirSync(path.join(process.cwd(), 'uploads'));
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Design
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

        doc.fontSize(40).text('M-KANISA ACCESS', { align: 'center' });
        doc.moveDown();
        doc.fontSize(25).text(data.churchName.toUpperCase(), { align: 'center' });
        doc.moveDown();
        doc.fontSize(20).text(`This is to certify that`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(30).fillColor('darkblue').text(data.memberName, { align: 'center' });
        doc.moveDown();
        doc.fillColor('black').fontSize(20).text(`Has successfully registered as a ${data.type}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(15).text(`Date: ${data.date}`, { align: 'right' });

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        });
    }
}
