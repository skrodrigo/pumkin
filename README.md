# N3xus

![Dashboard Screenshot](./public/nexus.png)

> **N3xus** - An integrated chat platform with multiple AI models, where users can switch between models, create new chats, organize conversations, and compare responses.

## Overview

Nexus is a complete SaaS application built with Next.js 15 that allows users to interact with the most advanced AI models through a modern and intuitive interface. The platform offers robust authentication, subscription system, usage control, and an optimized real-time chat experience.

### Key Features

- **Multiple AI Models**: Access to GPT-5, Gemini 2.5, Claude 4 Sonnet, and DeepSeek V3
- **Integrated Web Search**: Ability to search for up-to-date information on the web during conversations
- **Complete Authentication**: Login system with Google and email/password using Better Auth
- **Subscription System**: Stripe integration for Pro plans with custom limits
- **Usage Control**: Detailed monitoring of daily, weekly, and monthly usage
- **Real-Time Chat**: Streaming interface with markdown and syntax highlighting support
- **Responsive Design**: Interface optimized for desktop and mobile
- **Dark/Light Theme**: Full theme support with next-themes
- **Sharing**: Public conversation sharing system
- **History**: Complete navigation through conversation history

## Technical Architecture

### Main Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with Radix UI components
- **Authentication**: Better Auth with Stripe integration
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe for subscriptions and billing
- **AI**: AISDK + OpenRouter for unified model access
- **Deploy**: Optimized for Vercel

### Project Structure

```
nexus/
├── app/                          # App Router (Next.js 15)
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   └── chat/                 # Chat and streaming API
│   ├── chat/                     # Chat pages
│   │   ├── [id]/                 # Specific chat by ID
│   │   └── page.tsx              # Chat list
│   ├── share/[id]/               # Public sharing
│   └── generated/                # Generated Prisma client
├── components/                   # React components
│   ├── ai-elements/              # AI-specific components
│   ├── chat/                     # Chat components
│   ├── common/                   # Shared components
│   └── sidebar/                  # Side navigation
├── lib/                          # Utilities and configurations
│   ├── auth.ts                   # Better Auth configuration
│   ├── prisma.ts                 # Prisma client
│   └── openrouter.ts             # OpenRouter configuration
├── prisma/                       # Schema and migrations
├── server/                       # Server actions
└── public/                       # Static assets
```

## Setup and Installation

### Prerequisites

- Node.js 18+
- Configured accounts: OpenRouter, AISDK, Stripe, Google OAuth

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Models
OPENROUTER_API_KEY="your-openrouter-key"

# Payments
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (optional)
RESEND_API_KEY="re_..."
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nexus

# Install dependencies
npm install

# Set up the database
npx prisma generate
npx prisma migrate deploy

# Start the development server
npm run dev
```

Access [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

```bash
npm run dev          # Development server with Turbopack
npm run build        # Production build
npm run start        # Production server
npm run lint         # Linting with ESLint
```

## Data Model

### Main Entities

- **User**: Users with authentication and profiles
- **Chat**: Conversations with titles and metadata
- **Message**: Individual messages with JSON content
- **Subscription**: Stripe subscriptions with Pro plans
- **UserUsage**: Usage limit control by period

### Usage Limits (Pro Plan)

- **Daily**: 50 prompts
- **Weekly**: 250 prompts
- **Monthly**: 1000 prompts

## Deployment

### Vercel (Recommended)

1. Connect the repository to Vercel
2. Configure environment variables
3. Deployment will be automatic with each push

### Other Platforms

The application is compatible with any platform that supports Next.js:

- Railway
- Render
- AWS Amplify
- Netlify (with adaptations)

## Security

- **Authentication**: Better Auth with secure sessions
- **Authorization**: User verification on all protected routes
- **Rate Limiting**: Subscription-based usage control
- **Validation**: Zod for data validation
- **CSRF Protection**: Native Next.js protection

## Performance

- **Server Components**: Optimized server-side rendering
- **Streaming**: Real-time AI responses
- **Caching**: Intelligent route and data caching
- **Code Splitting**: On-demand loading
- **Image Optimization**: Automatic image optimization

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

---
