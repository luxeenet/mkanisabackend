import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { logger } from '@services/logger';
import { tenantMiddleware } from '@api/middlewares/tenant.middleware';
import { authMiddleware } from '@api/middlewares/auth.middleware';
import authRoutes from '@api/routes/auth.routes';
import churchRoutes from '@api/routes/church.routes';
import paymentRoutes from '@api/routes/payment.routes';
import smsRoutes from '@api/routes/sms.routes';
import onboardingRoutes from '@api/routes/onboarding.routes';
import ussdRoutes from '@api/routes/ussd.routes';
import adminRoutes from '@api/routes/admin.routes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: '*', // Adjust for production
    credentials: true,
}));

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
}));

// Multi-tenancy Middleware
app.use(tenantMiddleware);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/church', authMiddleware, churchRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/sms', authMiddleware, smsRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/ussd', ussdRoutes);
app.use('/api/v1/admin', authMiddleware, adminRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root Route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to M-KANISA ACCESS & PORTAL SYSTEM API',
        version: '1.0.0'
    });
});

export default app;
