# SaaS Starter Kit

A production-ready, multi-tenant SaaS application built with modern technologies and best practices.

## 🚀 Features

### Core Functionality
- **Multi-tenant Architecture** - Full organization isolation with role-based access control
- **Project Management** - Create and manage projects with task tracking
- **Task System** - Kanban-style task management with status tracking (To Do, In Progress, Done)
- **Team Collaboration** - Invite members, assign tasks, manage roles (Owner, Admin, Member, Viewer)
- **User Settings** - Profile management and organization configuration

### Authentication & Security
- **Auth0 Integration** - Secure authentication with OAuth support (Google, etc.)
- **Role-Based Permissions** - Granular access control across organizations
- **Session Management** - Secure cookie-based sessions
- **Protected Routes** - Automatic authentication checks

### Monitoring & Observability
- **Sentry Error Tracking** - Real-time error capture and reporting
- **Performance Monitoring** - Distributed tracing across database queries and API calls
- **Health Checks** - System, database, and GraphQL API health endpoints
- **Status Dashboard** - Real-time system status visualization
- **Request Logging** - Unique request IDs for distributed tracing
- **Structured Logging** - Comprehensive logging sent to Sentry

### Developer Experience
- **GraphQL API** - Auto-generated API with PostGraphile
- **Type Safety** - Full TypeScript coverage
- **Performance Metrics** - Dev-mode performance dashboard
- **Error Boundaries** - User-friendly error pages with recovery options
- **Hot Reload** - Fast development with Next.js Turbopack

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Server Components** - Optimal performance with RSC

### Backend
- **PostgreSQL** - Production-grade relational database
- **PostGraphile** - Auto-generated GraphQL API from PostgreSQL schema
- **Auth0** - Authentication and authorization
- **Node.js** - JavaScript runtime

### DevOps & Monitoring
- **Docker & Docker Compose** - Containerized development environment
- **Kubernetes** - Container orchestration with kind
- **Sentry** - Error tracking and performance monitoring
- **Health Checks** - System monitoring endpoints

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Auth0 account (free tier)
- Sentry account (free tier, optional but recommended)

### Installation

1. **Clone the repository**
```bash
   git clone <your-repo-url>
   cd saas-starter-kit
```

2. **Install dependencies**
```bash
   npm install
```

3. **Set up environment variables**
```bash
   cp .env.example .env.local
```

Fill in the following variables:
```env
   # Database
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/saas_starter_dev
   
   # Auth0
   AUTH0_SECRET=<generate with: openssl rand -hex 32>
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_CLIENT_ID=your-auth0-client-id
   AUTH0_CLIENT_SECRET=your-auth0-client-secret
   APP_BASE_URL=http://localhost:3000
   
   # GraphQL (optional - for direct API access)
   GRAPHQL_URL=http://localhost:5001/graphql
   
   # Sentry (optional)
   SENTRY_AUTH_TOKEN=your-sentry-token
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

4. **Start the database**
```bash
   docker-compose up -d
```

5. **Start the development server**
```bash
   npm run dev
```

6. **Start GraphQL API (in another terminal)**
```bash
   npm run graphql
```

The app will be available at:
- **App:** http://localhost:3000
- **GraphQL API:** http://localhost:5001/graphql
- **GraphiQL Interface:** http://localhost:5001/graphiql
- **Status Page:** http://localhost:3000/status

## 📊 Project Structure
```
saas-starter-kit/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── actions/          # Server actions for mutations
│   │   ├── api/              # API routes (health checks)
│   │   ├── auth/             # Auth0 routes
│   │   ├── organizations/    # Organization management
│   │   ├── projects/         # Project pages
│   │   ├── tasks/            # Task management
│   │   ├── team/             # Team collaboration
│   │   ├── settings/         # User/org settings
│   │   └── status/           # System status page
│   ├── components/           # React components
│   ├── lib/                  # Utilities and configurations
│   │   ├── auth0.ts          # Auth0 setup
│   │   ├── db/               # Database client
│   │   └── org/              # Organization context
│   └── proxy.ts              # Request logging middleware
├── database/
│   └── schema.sql            # PostgreSQL schema
├── k8s/                      # Kubernetes manifests
├── docker-compose.yml        # Docker services
├── Dockerfile                # Production container image
└── package.json
```

## 🗄️ Database Schema

- **users** - User accounts with Auth0 integration
- **organizations** - Multi-tenant organizations
- **organization_members** - User-organization relationships with roles
- **projects** - Project management
- **tasks** - Task tracking with assignments

## 🔐 Authentication Flow

1. User clicks "Login" → Redirected to Auth0
2. Auth0 handles OAuth (Google, etc.)
3. Callback creates/updates user in database
4. Auto-creates personal organization for new users
5. Session stored in secure cookies

## 🏥 Health & Monitoring

### Health Check Endpoints
- `GET /api/health` - Overall system health
- `GET /api/health/db` - Database connectivity
- `GET /api/health/graphql` - GraphQL API status

### Status Dashboard
Visit `/status` for real-time system monitoring with:
- Overall system status
- Individual service health checks
- Response time metrics
- Visual status indicators

### Sentry Integration
- Automatic error capture
- Performance tracing
- Structured logging
- Request ID tracking
- Custom instrumentation

## ☸️ Kubernetes Deployment

### Local Development with kind

1. **Install kind**
```bash
   brew install kind
   kind create cluster --name saas-starter
```

2. **Build and load image**
```bash
   docker build -t saas-starter:latest .
   kind load docker-image saas-starter:latest --name saas-starter
```

3. **Deploy to cluster**
```bash
   kubectl apply -f k8s/
   kubectl get pods -n saas-starter -w
```

4. **Initialize database**
```bash
   kubectl cp database/schema.sql saas-starter/$(kubectl get pod -n saas-starter -l app=postgres -o jsonpath='{.items[0].metadata.name}'):/tmp/schema.sql
   kubectl exec -it deployment/postgres -n saas-starter -- psql -U postgres -d saas_starter_prod -f /tmp/schema.sql
```

5. **Access the application**
```bash
   kubectl port-forward service/saas-starter-app 8080:3000 -n saas-starter
```
Visit: http://localhost:8080

### Deployment Architecture
```
┌─────────────────────────────────────────────────┐
│        Kubernetes Cluster (kind)                │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │    Namespace: saas-starter             │    │
│  │                                         │    │
│  │  ┌──────────────┐  Port 3000          │    │
│  │  │  Next.js App  │◄────────────────┐  │    │
│  │  └───────┬──────┘                   │  │    │
│  │          │                           │  │    │
│  │          │ http://graphql-service:5001│    │
│  │          ▼                           │  │    │
│  │  ┌──────────────┐  Port 5001        │  │    │
│  │  │ GraphQL API   │                   │  │    │
│  │  └───────┬──────┘                   │  │    │
│  │          │                           │  │    │
│  │          │ postgres-service:5432     │  │    │
│  │          ▼                           │  │    │
│  │  ┌──────────────┐  Port 5432        │  │    │
│  │  │  PostgreSQL   │                   │  │    │
│  │  │  + 5GB PVC    │                   │  │    │
│  │  └──────────────┘                   │  │    │
│  │                                       │  │    │
│  └───────────────────────────────────────┘  │    │
│                                              │    │
│  Port Forwarding for Local Access:          │    │
│  localhost:8080 ──────────────────────────┘    │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Kubernetes Features
- **Persistent Storage** - 5GB volume for PostgreSQL data
- **Health Probes** - Liveness and readiness checks
- **Resource Limits** - CPU and memory constraints
- **Internal Networking** - Service-to-service via DNS
- **ConfigMaps & Secrets** - Configuration management

### ⚠️ Production Deployment Notes

Before deploying to production:

1. **Update `k8s/secret.yaml`** with real credentials
2. **Use managed database** (AWS RDS, GCP CloudSQL, etc.)
3. **Configure ingress** for domain routing
4. **Enable TLS/SSL** with cert-manager
5. **Set up monitoring** with Prometheus/Grafana
6. **Configure backups** for persistent data

See `k8s/README.md` for detailed Kubernetes documentation.

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run graphql      # Start GraphQL API server
```

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Structured logging with Sentry
- Error boundaries for graceful failures

## 📈 Performance

- **Server Components** - Reduced client-side JavaScript
- **Database Query Tracking** - Performance monitoring on all queries
- **Caching Strategy** - Optimized data fetching
- **Request Tracing** - Unique IDs for debugging

## 🎯 Roadmap

### Completed ✅
- Multi-tenant architecture with role-based access control
- Authentication with Auth0 (Google OAuth)
- Project and task management with Kanban boards
- Team collaboration and member management
- Error tracking with Sentry (distributed tracing)
- Performance monitoring and instrumentation
- Health checks and status dashboard
- Request logging with unique request IDs
- Production-ready Docker images with multi-stage builds
- Complete Kubernetes deployment with kind
   - PostgreSQL with persistent storage
   - GraphQL API (PostGraphile v4.14.1)
   - Next.js application
   - ConfigMaps and Secrets
   - Health probes and resource limits
   - Internal service networking

### In Progress 🚧
- Production Kubernetes deployment (AWS EKS/GKE/AKS)
- CI/CD pipeline with GitHub Actions
- Ingress configuration for domain routing

### Planned 📋
- Horizontal Pod Autoscaler for auto-scaling
- Email notifications via SendGrid/AWS SES
- File uploads with S3 integration
- Advanced analytics dashboard
- API rate limiting with Redis
- Webhook support for integrations
- Network policies for enhanced security
- Secrets management with Sealed Secrets or Vault

## 📞 Contact

Built by **Jeffry Slater**

- **Email:** slaterj4e@gmail.com
- **GitHub:** [github.com/SlaterJ21](https://github.com/SlaterJ21)
- **Portfolio:** [Add your portfolio URL]

---

Built with ❤️ using Next.js, PostgreSQL, Kubernetes, and modern DevOps practices.