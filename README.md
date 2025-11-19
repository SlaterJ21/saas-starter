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
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/saas_starter_dev
   
   # Auth0
   AUTH0_SECRET=<generate with: openssl rand -hex 32>
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_ISSUER_BASE_URL=https://YOUR_DOMAIN.auth0.com
   AUTH0_CLIENT_ID=<your-auth0-client-id>
   AUTH0_CLIENT_SECRET=<your-auth0-client-secret>
   
   # GraphQL
   GRAPHQL_URL=http://localhost:5001/graphql
   
   # Sentry (optional)
   NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
```

4. **Start the database**
```bash
   docker-compose up -d
```

5. **Run database migrations**
```bash
   npm run db:migrate
```

6. **Start the development server**
```bash
   npm run dev
```

7. **Start GraphQL API (in another terminal)**
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
├── docker-compose.yml        # Docker services
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

## 🚀 Deployment

## ☸️ Kubernetes Deployment

This application is designed to run in Kubernetes for production-grade container orchestration.

### Prerequisites
- `kubectl` installed
- Local Kubernetes cluster (kind, minikube, or Docker Desktop)
- Docker for building images

### Quick Start with Kind

1. **Install kind (Kubernetes in Docker)**
```bash
   # macOS
   brew install kind
   
   # Verify installation
   kind version
   kubectl version --client
```

2. **Create a local cluster**
```bash
   kind create cluster --name saas-starter
```

3. **Build and load Docker image**
```bash
   # Build the Docker image
   docker build -t saas-starter:latest .
   
   # Load image into kind cluster
   kind load docker-image saas-starter:latest --name saas-starter
```

4. **Update Kubernetes secrets with your credentials**

   Edit `k8s/secret.yaml` and replace the placeholder values:
```bash
   # Edit the secret file
   nano k8s/secret.yaml
   
   # Update these values:
   # - AUTH0_SECRET (generate with: openssl rand -hex 32)
   # - AUTH0_DOMAIN (your Auth0 domain)
   # - AUTH0_CLIENT_ID (from Auth0 dashboard)
   # - AUTH0_CLIENT_SECRET (from Auth0 dashboard)
```

5. **Deploy to Kubernetes**
```bash
   # Deploy all resources
   kubectl apply -f k8s/
   
   # Watch pods start up
   kubectl get pods -n saas-starter -w
```

6. **Initialize database schema**
```bash
   # Copy schema to PostgreSQL pod
   kubectl cp database/schema.sql saas-starter/$(kubectl get pod -n saas-starter -l app=postgres -o jsonpath='{.items[0].metadata.name}'):/tmp/schema.sql
   
   # Execute schema
   kubectl exec -it deployment/postgres -n saas-starter -- psql -U postgres -d saas_starter_prod -f /tmp/schema.sql
   
   # Verify tables were created
   kubectl exec -it deployment/postgres -n saas-starter -- psql -U postgres -d saas_starter_prod -c "\dt"
```

7. **Access the application**
```bash
   # Port forward to access locally
   kubectl port-forward service/saas-starter 3000:3000 -n saas-starter
```
Visit: http://localhost:3000

### Troubleshooting Kubernetes Deployment

**Pods not starting:**
```bash
# Check pod status
kubectl get pods -n saas-starter

# View pod logs
kubectl logs -f deployment/postgres -n saas-starter
kubectl logs -f deployment/graphql -n saas-starter
kubectl logs -f deployment/saas-starter-app -n saas-starter

# Describe pod for events
kubectl describe pod  -n saas-starter
```

**Database connection issues:**
```bash
# Test PostgreSQL connectivity
kubectl exec -it deployment/postgres -n saas-starter -- psql -U postgres -d saas_starter_prod -c "SELECT version();"

# Check service DNS
kubectl exec -it deployment/saas-starter-app -n saas-starter -- nslookup postgres-service
```

**Image not found:**
```bash
# Rebuild and reload image
docker build -t saas-starter:latest .
kind load docker-image saas-starter:latest --name saas-starter

# Restart deployment
kubectl rollout restart deployment/saas-starter-app -n saas-starter
```

**Clean slate (delete everything):**
```bash
# Delete all resources
kubectl delete namespace saas-starter

# Delete kind cluster
kind delete cluster --name saas-starter
```

### Kubernetes Resources

The `k8s/` directory contains:
- **namespace.yaml** - Isolated namespace for the app
- **configmap.yaml** - Non-sensitive configuration
- **secret.yaml** - Sensitive credentials (Auth0, database)
- **postgres-deployment.yaml** - PostgreSQL database
- **postgres-service.yaml** - Database service
- **graphql-deployment.yaml** - PostGraphile GraphQL API
- **graphql-service.yaml** - GraphQL service
- **app-deployment.yaml** - Next.js application
- **app-service.yaml** - Application service
- **ingress.yaml** - HTTP routing (optional)

### Features
- **High Availability** - Multiple replicas for resilience
- **Health Checks** - Liveness and readiness probes
- **Resource Limits** - CPU and memory constraints
- **Auto-scaling** - Horizontal Pod Autoscaler ready
- **Rolling Updates** - Zero-downtime deployments
- **Secrets Management** - Encrypted credential storage

### Monitoring in Kubernetes

Health check endpoints integrated with K8s probes:
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Production Kubernetes

For production deployments:
- **AWS EKS** - Managed Kubernetes on AWS
- **Google GKE** - Google Kubernetes Engine
- **Azure AKS** - Azure Kubernetes Service
- **DigitalOcean** - Managed Kubernetes

### Useful Commands
```bash
# Check cluster status
kubectl cluster-info

# View all resources
kubectl get all -n saas-starter

# View logs
kubectl logs -f deployment/saas-starter-app -n saas-starter

# Scale application
kubectl scale deployment/saas-starter-app --replicas=3 -n saas-starter

# Delete cluster
kind delete cluster --name saas-starter
```

### Architecture
```
┌─────────────────────────────────────────┐
│           Kubernetes Cluster            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Namespace: saas-starter     │   │
│  │                                  │   │
│  │  ┌──────────┐  ┌──────────┐     │   │
│  │  │   App    │  │ GraphQL  │     │   │
│  │  │  Pods    │  │   Pods   │     │   │
│  │  └────┬─────┘  └────┬─────┘     │   │
│  │       │             │            │   │
│  │  ┌────▼─────────────▼─────┐     │   │
│  │  │    PostgreSQL Pod      │     │   │
│  │  └────────────────────────┘     │   │
│  │                                  │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Production Checklist
- [ ] Set up production Auth0 application
- [ ] Configure production database (e.g., AWS RDS, Supabase)
- [ ] Set up Sentry project for production
- [ ] Configure environment variables in hosting platform
- [ ] Enable SSL/HTTPS
- [ ] Set up monitoring alerts
- [ ] Configure backup strategy

### Recommended Platforms
- **Vercel** - Zero-config Next.js deployment
- **Railway** - PostgreSQL + app hosting
- **Render** - Full-stack deployment
- **AWS** - Production-grade infrastructure

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run graphql      # Start GraphQL API server
npm run db:migrate   # Run database migrations
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

## 🤝 Contributing

This is a personal project/portfolio piece, but suggestions are welcome!

## 📄 License

MIT License - feel free to use this as a starting point for your own projects!

## 🎯 Roadmap

## 🎯 Roadmap

### Completed ✅
- Multi-tenant architecture
- Authentication with Auth0
- Project and task management
- Team collaboration
- Error tracking with Sentry
- Performance monitoring
- Health checks and status page
- Request logging and tracing

### In Progress 🚧
- **Kubernetes deployment** - Local cluster setup with kind
- Production-ready Docker images
- K8s manifests for all services

### Planned 📋
- Docker production optimization
- CI/CD pipeline with GitHub Actions
- Email notifications
- File uploads
- Activity feed
- Advanced analytics dashboard
- API rate limiting
- Webhook support
- Production K8s deployment (EKS/GKE/AKS)

## 📞 Contact

Built by Jeffry Slater - slaterj4e@gmail.com

**GitHub:** github.com/SlaterJ21

---

Built with ❤️ using Next.js, PostgreSQL, and modern DevOps practices.