# TRUEFAM Contribution Tracker - System Architecture

## Overview

This is a real-time contribution tracking system for bereavement campaigns that automates the capture and processing of payment notifications from various platforms (Zelle, Venmo, Cash App, M-Pesa, Airtel Money). The system extracts payment details from SMS and email notifications, processes them, and syncs the data to Google Sheets for easy management.

**Project Status:** Production-ready with complete mobile-first UI and automated processing pipeline.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 11, 2025)

✓ Implemented complete TRUEFAM Contribution Tracker with mobile-first design
✓ Added real-time SMS and email parsing for all payment platforms
✓ Built responsive UI with status bar, navigation, and WebSocket notifications
✓ Created automated Google Sheets integration with KES currency formatting
✓ Implemented manual entry system with floating action button
✓ Added comprehensive system monitoring and logging
✓ Set up PostgreSQL database with proper schema and relationships
✓ Configured WebSocket server for real-time updates
✓ **NEW: Complete WhatsApp Business API integration**
✓ **NEW: Enhanced message parsing for multiple payment platforms**
✓ **NEW: WhatsApp webhook verification and processing**
✓ **NEW: Automatic WhatsApp confirmation messages**
✓ **NEW: WhatsApp configuration UI in settings**

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Framework**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Mobile-First Design**: Responsive design optimized for mobile devices with a frame-based layout

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL via Neon Database with Drizzle ORM
- **Real-time Communication**: WebSocket server for live updates
- **Build System**: Vite for frontend bundling, esbuild for backend

### Data Storage Solutions
- **Primary Database**: PostgreSQL with the following schema:
  - `campaigns`: Campaign management with start/end dates and Google Sheets integration
  - `contributions`: Payment records with sender, amount, member ID, and platform tracking
  - `api_configs`: Configuration storage for external service integrations
  - `system_logs`: Application logging and monitoring
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Storage**: PostgreSQL-based session management

## Key Components

### Data Processing Pipeline
1. **Message Parsing Services**:
   - `SMSParser`: Extracts payment data from SMS notifications using regex patterns
   - `EmailParser`: Processes email notifications from payment platforms
   - `WhatsAppParser`: Advanced parsing for WhatsApp Business API messages
   - Pattern matching for M-Pesa, Airtel Money, Zelle, Venmo, Cash App, PayPal, and Bank Transfers

2. **Webhook Handler**:
   - Centralized processing of incoming payment notifications
   - Real-time WebSocket broadcasting to connected clients
   - Automatic Google Sheets synchronization

3. **Storage Layer**:
   - Database abstraction with both production (PostgreSQL) and development (in-memory) implementations
   - Type-safe schema definitions with Zod validation

### User Interface Components
- **Mobile Frame**: Simulated mobile app interface with status bar and navigation
- **Dashboard**: Real-time overview with quick stats and recent transactions
- **Transaction Management**: Searchable transaction history with filtering
- **Settings**: Campaign and API configuration management
- **System Logs**: Real-time monitoring and debugging interface

### Real-time Features
- **WebSocket Integration**: Live updates for new contributions
- **Notification System**: Toast notifications for system events
- **Auto-refresh**: Periodic data updates without page reloads

## Data Flow

1. **Payment Notification Reception**: 
   - SMS/Email webhooks receive payment notifications
   - Raw messages are stored for audit purposes

2. **Data Extraction**:
   - Parser services extract structured data (sender, amount, member ID, date, platform)
   - Validation ensures data integrity before processing

3. **Database Storage**:
   - Contributions are stored with campaign association
   - System logs track all processing activities

4. **External Synchronization**:
   - Google Sheets API integration for external data sharing
   - Configurable sheet formatting and update mechanisms

5. **Real-time Updates**:
   - WebSocket broadcasts notify connected clients
   - UI updates automatically reflect new data

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL)
- **UI Components**: Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Native fetch API with TanStack Query
- **WebSocket**: Built-in WebSocket support

### Payment Platform Integrations
- **M-Pesa**: SMS, email, and WhatsApp notification parsing (KES currency)
- **Airtel Money**: Multi-channel mobile money integration (KES currency)
- **Zelle**: SMS, email, and WhatsApp notification processing (USD currency)
- **Venmo**: Transaction notification handling (USD currency)
- **Cash App**: Payment alert processing (USD currency)
- **PayPal**: International payment support (USD/EUR currency)
- **Bank Transfers**: Generic bank transfer parsing (multi-currency)
- **WhatsApp Pay**: Native WhatsApp payment integration

### External Services
- **Google Sheets API**: For data export and sharing
- **SMS Webhooks**: For receiving payment notifications
- **Email Processing**: For payment notification emails
- **WhatsApp Business API**: For receiving and sending WhatsApp messages
- **Meta Webhooks**: For WhatsApp Business webhook verification and processing

## Deployment Strategy

### Development Environment
- **Hot Module Replacement**: Vite development server with HMR
- **Database**: Local PostgreSQL or Neon Database
- **Real-time Testing**: WebSocket connections work in development

### Production Build
- **Frontend**: Vite builds optimized React bundle
- **Backend**: esbuild creates Node.js production bundle
- **Database Migrations**: Drizzle handles schema updates
- **Environment Variables**: Database URL and API keys required

### Key Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment configuration
- Additional API keys for external service integrations

The system is designed to be self-contained with minimal external dependencies, focusing on reliability and real-time performance for contribution tracking scenarios.