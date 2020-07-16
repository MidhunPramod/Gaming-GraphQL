const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const graphQLSchema = require("./graphql/schema/index");
const graphQLResolvers = require("./graphql/resolvers/index");
const mongoose = require("mongoose");

const dotenv = require("dotenv").config();

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
  .connect(process.env.MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log("Connected to server");
    });
  })
  .catch((err) => {
    console.log(err);
  });
