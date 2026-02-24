# Smart Restaurant Dashboard

## Overview

Smart Restaurant is a SaaS dashboard application for restaurant management, providing online menu services, QR-code ordering, and online payment functionality. The application features a modern, responsive dashboard interface inspired by Ozon Seller, Stripe Dashboard, and Notion designs.

The project is a full-stack TypeScript application with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Icons**: Lucide React icons and React Icons for brand icons (WhatsApp)
- **Charts**: Recharts for data visualization

The frontend follows a component-based architecture with:
- Reusable UI components in `client/src/components/ui/`
- Feature-specific components in `client/src/components/`
- Page components in `client/src/pages/`
- Custom hooks in `client/src/hooks/`

### Backend Architecture

- **Framework**: Express.js with TypeScript
- **Server**: Node.js with tsx for TypeScript execution
- **API Design**: RESTful endpoints under `/api/` prefix
- **Storage Layer**: Abstracted storage interface (`IStorage`) with in-memory implementation (`MemStorage`)
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage

The backend uses a layered architecture:
- `server/index.ts` - Application entry point and middleware configuration
- `server/routes.ts` - API route definitions
- `server/storage.ts` - Data access layer with storage interface
- `server/vite.ts` - Vite development server integration
- `server/static.ts` - Static file serving for production

### Database Schema

PostgreSQL database with Drizzle ORM for schema management and migrations:

- **users** - User accounts with authentication
- **restaurants** - Restaurant entities with status tracking
- **tasks** - Task management for daily operations
- **support_tickets** - Customer support ticket tracking
- **articles** - Knowledge base articles

Schema definitions are in `shared/schema.ts` using Drizzle's table definitions with Zod validation schemas generated via drizzle-zod.

### Design System

Custom design tokens matching Choco Business (Choco бизнес) platform aesthetic:
- Primary accent color: Red/Crimson (`hsl(0 72% 51%)`)
- Light/white sidebar background
- Active sidebar items use light red background with red text/icons
- Inter font family
- CSS variables for light/dark mode theming
- Custom elevation and shadow system
- Branding: "Choco бизнес" with heart icon

## External Dependencies

### Database
- **PostgreSQL** - Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle ORM** - TypeScript ORM with schema migrations
- **drizzle-kit** - CLI tool for database migrations (`db:push` command)

### Third-Party Integrations
- **WhatsApp Business** - Floating chat button integration for customer support
- **AI Chat Consultant** - In-app AI chat functionality (UI implemented, backend integration pending)

### Key NPM Packages
- `@tanstack/react-query` - Server state management
- `express-session` / `connect-pg-simple` - Session management
- `recharts` - Chart/graph visualization
- `date-fns` - Date manipulation utilities
- `zod` / `zod-validation-error` - Runtime validation

### Training Simulator
- Interactive step-by-step simulator for teaching Choco platform features
- Supports **Web (16:9)** and **Mobile (9:16)** simulator modes with toggle
- Percentage-based hotspot coordinates for clickable areas
- Click sound effects, blue flash on wrong clicks, confetti on completion
- Mobile mode displays in a phone-shaped frame with notch
- Steps filtered by `screenType: "web" | "mobile"` field
- Module 9 (Stop-list) has 10 web steps + 10 mobile steps

### Localization System
- Full trilingual support: Russian (ru), Kazakh (kk), English (en)
- Language context in `client/src/lib/i18n.tsx` with `useLanguage()` hook
- 120+ predefined translation keys for all UI elements (buttons, labels, menus, roles, products)
- Language choice persisted in localStorage (`smart_restaurant_language` key)
- Dynamic content translation via `/api/translate` endpoint using OpenAI gpt-4o-mini
- Translation caching: client-side in localStorage (max 500 entries) + server-side in-memory Map (max 1000 entries)
- Rate limiting on translate API: 60 requests per minute per IP, max 5000 chars per request
- `useTranslatedText(text)` hook for auto-translating Russian text to current language
- `TranslatedText` component in training.tsx wraps module titles/descriptions for auto-translation
- Language switcher in dashboard header (dropdown)
- Chat greeting resets when language changes
- All components localized: sidebar, role modal, dashboard, training page, floating buttons, header

### Training System (Академия Choco)
- All lessons integrated into `/training` route (training.tsx)
- Includes lesson #15 "Как в Iiko добавить тип оплаты «Choco»" with video, content, quiz
- Full RU/KZ translations in `client/src/lib/training-i18n.ts`
- Role-based module access configured in `client/src/lib/role-context.tsx`
- Cover images stored in `client/public/onboarding/` and `client/public/training/covers/`
- Previous standalone onboarding page removed (was at `/onboarding`)

### AI Chat Consultant
- OpenAI gpt-4o-mini integration at `/api/ai/chat` endpoint
- Knowledge base loaded from `knowledge/knowledge_base.md` (9 sections: orders, payments, returns, reports, clients, employees, menu, support, Kazakh instructions)
- Bilingual support: Russian and Kazakh (auto-detects language from question)
- WhatsApp-style short responses (3-5 sentences max)
- Keyword-based lesson topic finder maps questions to relevant training topics (Russian + Kazakh keywords)
- Every non-fallback answer ends with "Узнать больше в уроке: [topic]" (or Kazakh equivalent)
- Fallback RU: "Этой информации пока нет в базе. Я передам ваш вопрос менеджеру для дополнения инструкции."
- Fallback KZ: "Бұл ақпарат әзірге базада жоқ. Сұрағыңызды менеджерге жібереміз."
- Chat UI in `client/src/components/floating-buttons.tsx` (floating button bottom-right)

### Build & Development
- Vite with React plugin for frontend bundling
- esbuild for backend production bundling
- Replit-specific plugins for development environment integration