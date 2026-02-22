# M-KANISA ACCESS & PORTAL SYSTEM (Backend)

[![Production Ready](https://img.shields.io/badge/Status-Production--Ready-brightgreen)](https://github.com/luxeenet/mkanisabackend)

## 📖 Overview
M-KANISA is a professional-grade Church Management System (CMS) designed for the Tanzanian market, featuring deep integration with Mobile Money (M-Pesa, Airtel Money) and Bulk SMS automation.

## 🛠️ Features
- **Multi-Tenant Architecture**: Support for parent churches and multiple branches.
- **FinTech Integration**: Automated Sadaka and Subscription processing.
- **Bulk SMS Engine**: High-performance queuing for mass communications.
- **Dynamic Documents**: PDF Certificate generation for members and partners.
- **White-Label Support**: Custom branding per church tenant.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+

### Setup
1. Clone the repository
2. Copy `.env.example` to `.env`
3. Run `docker-compose up --build`
4. Run migrations: `npm run knex migrate:latest`

## 🔐 Security
- JWT-based authentication with refresh tokens.
- Role-Based Access Control (RBAC).
- Input validation via Zod.
- Secure webhook signature verification placeholders.

## 📄 License
Internal Proprietary for M-KANISA Project.
