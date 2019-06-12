const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");

const server = new ApolloServer({ typeDefs });

const port = 4000;

server.listen({ port }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
