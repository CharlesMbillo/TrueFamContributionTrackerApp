# TRUEFAM Contribution Tracker - System Architecture

## Overview

This is a real-time contribution tracking system for bereavement campaigns that automates the capture and processing of payment notifications from various platforms (Zelle, Venmo, Cash App, M-Pesa, Airtel Money). The system extracts payment details from SMS and email notifications, processes them, and syncs the data to Google Sheets for easy management.

## User Preferences

Preferred communication style: Simple, everyday language.

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
   - Pattern matching for Zelle, Venmo, Cash App, M-Pesa, and Airtel Money

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
- **Zelle**: SMS and email notification parsing
- **Venmo**: Transaction notification processing
- **Cash App**: Payment alert handling
- **M-Pesa**: Mobile money notification support
- **Airtel Money**: Alternative mobile payment integration

### External Services
- **Google Sheets API**: For data export and sharing
- **SMS Webhooks**: For receiving payment notifications
- **Email Processing**: For payment notification emails

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