const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const graphQLSchema = require("./graphql/schema/index");
const graphQLResolvers = require("./graphql/resolvers/index");
const mongoose = require("mongoose");

const app = express();

app.use(express.json({ extended: false }));

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQLSchema,
    rootValue: graphQLResolvers,
    graphiql: true,
  })
);

mongoose
  .connect(
    "mongodb+srv://midhun:midhun123@cluster0.c1hxm.mongodb.net/gaming?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(3000, () => {
      console.log("Connected to server");
    });
  })
  .catch((err) => {
    console.log(err);
  });
