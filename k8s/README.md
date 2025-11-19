# Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the SaaS Starter application.

## 📋 Files

- **namespace.yaml** - Isolated namespace for all resources
- **configmap.yaml** - Non-sensitive configuration (database host, ports, URLs)
- **secret.yaml** - Sensitive credentials (⚠️ Update before deploying!)
- **postgres-pvc.yaml** - Persistent storage for PostgreSQL
- **postgres-deployment.yaml** - PostgreSQL database deployment
- **postgres-service.yaml** - PostgreSQL internal service
- **graphql-deployment.yaml** - PostGraphile GraphQL API
- **graphql-service.yaml** - GraphQL API internal service
- **app-deployment.yaml** - Next.js application
- **app-service.yaml** - Application service

## 🔐 Before Deploying

### Required: Update Secrets

**⚠️ IMPORTANT:** You must update `secret.yaml` with your actual credentials before deploying.

Edit `k8s/secret.yaml` and replace these placeholder values:
```yaml
stringData:
  # Generate a secure secret (32+ characters)
  AUTH0_SECRET: "replace-with-your-auth0-secret"
  
  # Your Auth0 domain (from Auth0 dashboard)
  AUTH0_DOMAIN: "your-domain.auth0.com"
  
  # Auth0 Application credentials (from Auth0 dashboard)
  AUTH0_CLIENT_ID: "your-auth0-client-id"
  AUTH0_CLIENT_SECRET: "your-auth0-client-secret"
  
  # Optional: Sentry credentials
  SENTRY_AUTH_TOKEN: "your-sentry-token"
  NEXT_PUBLIC_SENTRY_DSN: "your-sentry-dsn"
```

### Generate AUTH0_SECRET
```bash
# Generate a secure 32-character secret
openssl rand -hex 32
```

### Get Auth0 Credentials

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Navigate to Applications
3. Copy:
    - Domain
    - Client ID
    - Client Secret

## 🚀 Deployment Steps

1. **Update secrets** (see above)
2. **Apply manifests:**
```bash
   kubectl apply -f k8s/
```
3. **Watch deployment:**
```bash
   kubectl get pods -n saas-starter -w
```
4. **Initialize database:**
```bash
   kubectl cp database/schema.sql saas-starter/$(kubectl get pod -n saas-starter -l app=postgres -o jsonpath='{.items[0].metadata.name}'):/tmp/schema.sql
   kubectl exec -it deployment/postgres -n saas-starter -- psql -U postgres -d saas_starter_prod -f /tmp/schema.sql
```

## 🔍 Verification
```bash
# Check all resources
kubectl get all -n saas-starter

# Check pod logs
kubectl logs -f deployment/postgres -n saas-starter

# Test database
kubectl exec -it deployment/postgres -n saas-starter -- psql -U postgres -d saas_starter_prod -c "\dt"
```

## 🌐 Accessing the Application
```bash
# Port forward to local machine
kubectl port-forward service/saas-starter 3000:3000 -n saas-starter

# Visit http://localhost:3000
```

## 📊 Resource Limits

Current configuration:
- **PostgreSQL:** 256Mi-512Mi RAM, 250m-500m CPU
- **GraphQL API:** 128Mi-256Mi RAM, 100m-250m CPU
- **Next.js App:** 256Mi-512Mi RAM, 250m-500m CPU

Adjust in deployment files based on your needs.

## 🔒 Security Notes

- **Never commit real secrets** to version control
- Use Kubernetes Secrets for sensitive data
- Consider using sealed-secrets or external secret managers for production
- PostgreSQL credentials should be rotated regularly
- Use network policies to restrict pod communication in production

## 🧹 Cleanup
```bash
# Delete all resources
kubectl delete namespace saas-starter

# Or delete individual resources
kubectl delete -f k8s/
```