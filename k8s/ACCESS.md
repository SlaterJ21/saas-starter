# Quick Access to Running Services

## Port Forward Commands

Run these commands to access services locally:

### Next.js Application
```bash
kubectl port-forward service/saas-starter-app 3000:3000 -n saas-starter
```
**Access:** http://localhost:3000

### GraphQL API (GraphiQL Interface)
```bash
kubectl port-forward service/graphql-service 5001:5001 -n saas-starter
```
**Access:** http://localhost:5001/graphiql

### PostgreSQL Database
```bash
kubectl port-forward service/postgres-service 5432:5432 -n saas-starter
```
**Connect:** `psql -h localhost -p 5432 -U postgres -d saas_starter_prod`

## All Services at Once
```bash
# Terminal 1: App
kubectl port-forward service/saas-starter-app 3000:3000 -n saas-starter

# Terminal 2: GraphQL  
kubectl port-forward service/graphql-service 5001:5001 -n saas-starter

# Terminal 3: Database
kubectl port-forward service/postgres-service 5432:5432 -n saas-starter
```

## View Logs
```bash
# App logs
kubectl logs -f deployment/saas-starter-app -n saas-starter

# GraphQL logs
kubectl logs -f deployment/graphql -n saas-starter

# Database logs
kubectl logs -f deployment/postgres -n saas-starter
```

## Health Checks
```bash
# App health
curl http://localhost:3000/api/health

# Database health
curl http://localhost:3000/api/health/db

# GraphQL health
curl http://localhost:3000/api/health/graphql
```