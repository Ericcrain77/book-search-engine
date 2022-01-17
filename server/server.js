const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');

// import typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

const db = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  // create new server and pass schemas through
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware
  });

  // start server
  await server.start();

  // integrate middleware
  server.applyMiddleware({ app });

  // log GraphQL Query Server
  console.log(`Use GraphQL to test queries and mutations at http://localhost:${PORT}${server.graphqlPath}`)
};

startServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}!`);
  });
});