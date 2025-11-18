const { postgraphile } = require('postgraphile');
const { default: PostGraphileLogger } = require('@graphile/logger');

const isDev = process.env.NODE_ENV !== 'production';

const middleware = postgraphile(
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/saas_starter_dev',
  'public',
  {
    watchPg: isDev,
    graphiql: isDev,
    enhanceGraphiql: isDev,
    dynamicJson: true,
    setofFunctionsContainNulls: false,
    ignoreRBAC: false,
    showErrorStack: isDev,
    extendedErrors: isDev ? ['hint', 'detail', 'errcode'] : ['errcode'],
    allowExplain: isDev,
    legacyRelations: 'omit',
    exportGqlSchemaPath: isDev ? 'schema.graphql' : null,
    sortExport: true,
    enableQueryBatching: true,
    disableQueryLog: !isDev,
    pgSettings: async (req) => {
      // We'll add row-level security settings here later
      return {};
    },
  }
);

const express = require('express');
const app = express();

app.use(middleware);

const PORT = process.env.GRAPHQL_PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 PostGraphile server running on http://localhost:${PORT}/graphiql`);
  console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
