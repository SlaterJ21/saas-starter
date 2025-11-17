# Architecture Overview

## System Design

### Multi-Tenant Architecture
- Organization-based tenancy
- Row-level security in PostgreSQL
- User belongs to multiple organizations

### Tech Stack
- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend API:** PostGraphile (GraphQL over PostgreSQL)
- **Database:** PostgreSQL 15
- **Authentication:** Auth0
- **Deployment:** AWS

### Key Patterns
- Server Components for data fetching
- Auth0 for authentication
- GraphQL for API layer
- Role-based access control

## Status
🚧 Day 1 - Foundation setup