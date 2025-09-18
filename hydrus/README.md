# 🏗️ Hydrus Billing Platform

A self-hostable, open-source billing platform with configurable pricing models, automated dunning, and proactive churn prevention.

## ✨ Features

### 🎯 Core Platform
- **Self-hostable** - Deploy anywhere with full control over your data
- **Next.js 14** - Modern React framework with App Router
- **TypeScript** - Type-safe development experience
- **Prisma** - Database ORM with PostgreSQL support
- **NextAuth.js** - Secure email/magic link authentication

### 💳 Billing & Pricing
- **Multiple Pricing Models**:
  - Standard Subscriptions (monthly/yearly)
  - Metered Billing (pay-per-use)
  - Prepaid Credits system
- **Flexible Trial Configuration**:
  - Free trials (no payment method required)
  - Paid trials (payment method verification)
- **Multi-currency Support** (USD, EUR, GBP)

### 🎨 Admin Dashboard
- **Product Management** - Visual pricing model configuration
- **Customer Management** - View and manage customer accounts
- **Webhook Monitoring** - Track Stripe webhook events
- **API Key Management** - Generate and manage API keys
- **Responsive Design** - Works on all devices

### 🔄 Automation (Coming Soon)
- **Automated Dunning** - Payment failure notifications
- **Churn Prevention** - Proactive customer retention
- **Email Campaigns** - Automated engagement sequences

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Stripe account
- Resend account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hydrus-billing-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Random secret for NextAuth.js
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `RESEND_API_KEY` - Your Resend API key

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Development Status

This is an MVP version with the following completed:

✅ **Foundation**
- [x] Next.js 14 project structure
- [x] Database schema with Prisma
- [x] Authentication system
- [x] Admin dashboard UI

✅ **Product Management**
- [x] Product configuration form
- [x] Pricing model selection
- [x] Trial configuration
- [x] Form validation with Zod

🚧 **In Progress**
- [ ] Stripe API integration
- [ ] Webhook handling
- [ ] Customer management
- [ ] Payment processing

🔮 **Planned**
- [ ] Automated dunning system
- [ ] Churn prevention features
- [ ] Email automation
- [ ] Analytics dashboard
- [ ] API endpoints for integration

## 🏛️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL (serverless-compatible)
- **Authentication**: NextAuth.js with email provider
- **Payments**: Stripe
- **Email**: Resend
- **UI Components**: Shadcn/UI + Radix UI

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   └── auth/              # Authentication pages
├── components/
│   ├── admin/             # Admin-specific components
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── validations/       # Zod schemas
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database connection
│   └── stripe.ts         # Stripe configuration
└── middleware.ts          # Route protection
```

## 🎯 Business Model Context

Hydrus operates on an **open-core model**:

- **Open Source**: Complete codebase available for self-hosting
- **Commercial**: Managed cloud hosting for enterprises who prefer SaaS

This ensures the platform remains accessible to startups while providing a sustainable business model.

## 🤝 Contributing

This project is in active development. Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](docs/) (Coming Soon)
- [API Reference](docs/api/) (Coming Soon)
- [Deployment Guide](docs/deployment/) (Coming Soon)

---

Built with ❤️ for the developer community