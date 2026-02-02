# AI TPRM System - Quick Start Guide

## Prerequisites

Before running the application, ensure you have:

1. **Node.js 18+** - Download from https://nodejs.org
2. **PostgreSQL 15+** - Download from https://www.postgresql.org/download/windows/
3. **Git** - Download from https://git-scm.com/download/windows
4. **OpenAI API Key** or **Anthropic API Key** for AI agents

## Quick Setup (Windows)

### Step 1: Install Dependencies

Open PowerShell or Command Prompt in the project directory and run:

```bash
npm install
```

### Step 2: Configure PostgreSQL

1. Start PostgreSQL service
2. Open pgAdmin or psql and create database:

```sql
CREATE DATABASE tprm_db;
CREATE USER tprm_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tprm_db TO tprm_user;
```

### Step 3: Configure Environment

Copy the example environment file:

```bash
copy .env.example .env.local
```

Edit `.env.local` with your values:

```env
DATABASE_URL="postgresql://tprm_user:your_password@localhost:5432/tprm_db"
NEXTAUTH_SECRET="generate-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-your-openai-key"
```

To generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Initialize Database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Default Login Credentials

For demo/testing:
- Email: admin@sleepnumber.com
- Password: admin123

Or use "Continue to Demo" to bypass authentication.

## Quick Usage Guide

### 1. Add a Vendor

1. Navigate to **Vendors** in the sidebar
2. Click **Add Vendor**
3. Fill in vendor information
4. Click **Create Vendor**

### 2. Run Risk Profile (VERA Agent)

1. Open the vendor detail page
2. Click **Run Risk Profile (VERA)**
3. Wait for the AI agent to analyze and create risk profile
4. View the assigned risk tier and score

### 3. Run Assessment (CARA Agent)

For Critical/High risk vendors:
1. On the vendor detail page, click **Run Assessment (CARA)**
2. The agent performs detailed multi-dimensional assessment
3. View comprehensive risk scores and recommendations

### 4. Upload Documents

1. Navigate to **Documents**
2. Upload security documents (SOC2, penetration tests, etc.)
3. Run SARA agent for AI-powered analysis
4. View extracted findings

### 5. View Dashboard

The main dashboard shows:
- Overall vendor risk distribution
- Open findings count
- AI agent activity
- Alerts and notifications

## API Reference

### Orchestrator API (Full Workflow)

```bash
# Onboard a new vendor (runs VERA -> CARA -> DORA -> RITA)
POST /api/orchestrator
{
  "vendorId": "vendor-id",
  "dataTypesAccessed": ["Customer Data", "PII"],
  "hasPiiAccess": true,
  "businessCriticality": "BUSINESS_CRITICAL"
}

# Process a document (runs SARA -> MARS -> RITA)
PUT /api/orchestrator
{
  "vendorId": "vendor-id",
  "documentId": "document-id",
  "documentContent": "Document text content..."
}

# Run maintenance cycle
PATCH /api/orchestrator
```

### Individual Agent APIs

```bash
# VERA - Risk Profiling
POST /api/agents/vera

# CARA - Detailed Assessment
POST /api/agents/cara

# SARA - Document Analysis
POST /api/agents/sara

# RITA - Report Generation
POST /api/agents/rita
GET /api/agents/rita  # Dashboard data

# MARS - Remediation
POST /api/agents/mars
PUT /api/agents/mars   # Risk acceptance
GET /api/agents/mars   # Check overdue
```

## AI Agent Summary

| Agent | Purpose | Trigger |
|-------|---------|---------|
| **VERA** | Vendor risk profiling | New vendor registration |
| **CARA** | Detailed assessment | Critical/High risk vendor |
| **DORA** | Document collection | Assessment initiated |
| **SARA** | Security analysis | Documents received |
| **RITA** | Report generation | Analysis complete |
| **MARS** | Remediation management | Findings identified |

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env.local
- Run `npx prisma db push` again

### AI Agent Not Working
- Verify OPENAI_API_KEY or ANTHROPIC_API_KEY is set
- Check API key has sufficient credits
- Review console for error messages

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## Project Structure

```
ai-tprm-system/
├── src/
│   ├── app/           # Next.js pages and API routes
│   ├── components/    # React components
│   └── lib/
│       └── agents/    # AI agent implementations
├── prisma/            # Database schema
├── docs/              # Documentation
└── public/            # Static assets
```

## Support

For issues or questions, refer to:
- `docs/tprm-architecture.md` - Complete system documentation
- API logs in browser console
- Prisma Studio: `npx prisma studio`
