# Business Intelligence Platform

A high-performance, intelligent Business Dashboard designed to process financial documents (CSV, PDF) and instantly generate actionable KPIs, dynamic charts, and AI-driven executive summaries.

## 🚀 Features

- **Executive Briefing**: High-level dashboard displaying Business Health Score, Total Revenue, Cash Flow, and Active Customers. Includes interactive trend charts and dynamic text-to-speech AI summaries.
- **Document Intel**: Upload engine supporting CSVs and PDFs. Uses a robust layout-aware PDF parser to map document coordinates and extract tabular financial data natively in the browser.
- **Zero-Latency Architecture**: Implements a "Process Once, Store Once, Reuse Everywhere" philosophy. Documents are fingerprinted via SHA-256 hashes. Cached analysis is rendered instantly from LocalStorage at 0ms latency while synchronizing seamlessly with Supabase in the background.
- **BizPulse AI**: Conversational interface for dynamic inquiries into business health.
- **Period Comparison**: Side-by-side analysis for MoM or YoY performance tracking.

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS Modules with modern Glassmorphism aesthetics
- **Database / Backend**: Supabase (PostgreSQL)
- **Document Parsing**: `pdfjs-dist` (Web Workers)

## 🛠️ Setup & Installation

### 1. Environment Configuration
Create a `.env` or `.env.local` file in the root of the project with your Supabase credentials:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Database Migration
To enable the zero-latency caching system, you must create the necessary tables in your Supabase database. 
1. Open your Supabase SQL Editor.
2. Run the SQL script found in [`database.sql`](./database.sql) to initialize the core tables.
3. Run the SQL script found in [`database_update.sql`](./database_update.sql) to provision the `ai_analysis_cache` table.

### 3. Running Locally
Install dependencies and run the development server:
```bash
npm install
npm run dev
```

## 🧠 Architecture Overview

The system relies on three core layers:
1. **Intelligence Engine (`src/lib/IntelligenceEngine.ts`)**: A pure TypeScript algorithm that processes extracted financial data to calculate profit margins, track inventory health, categorize revenue sources, and compute a comprehensive Business Health Score (0-100).
2. **Business Data Context (`src/context/BusinessDataContext.tsx`)**: The state manager that orchestrates document ingestion, triggers the intelligence pipeline upon encountering new file hashes, and manages the dual-layer cache (LocalStorage + Supabase).
3. **Responsive UI Engine**: Renders data immediately upon hydration, providing an ultra-fast, skeleton-free experience for returning users.
