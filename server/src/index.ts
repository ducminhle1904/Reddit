require("dotenv").config();
import "reflect-metadata";
import express from "express";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { HelloResolver } from "./resolver/hello";
import { UserResolver } from "./resolver/user";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import session from "express-session";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Context } from "./types/Context";
import { PostResolver } from "./resolver/post";
import cors from "cors";
import { Upvote } from "./entities/Upvote";
import { buildDataLoaders } from "./utils/dataLoader";
import path from "path";

const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    ...(__prod__
      ? { url: process.env.DATABASE_URL }
      : {
          database: "reddit",
          username: process.env.DB_USERNAME_DEV,
          password: process.env.DB_PASSWORD_DEV,
        }),

    logging: true,
    ...(__prod__ ? {} : { synchronize: true }),
    ...(__prod__
      ? {
          extra: {
            ssl: {
              rejectUnauthorized: false,
            },
          },
          ssl: true,
        }
      : {}),
    entities: [User, Post, Upvote],
    migrations: [path.join(__dirname, "/migrations/*")],
  });

  if (__prod__) await connection.runMigrations();

  const app = express();
  app.use(
    cors({
      origin: __prod__
        ? process.env.CORS_ORIGIN_PROD
        : process.env.CORS_ORIGIN_DEV,
      credentials: true,
    })
  );

  // Session/Cookie store
  const mongoUrl = `mongodb+srv://${process.env.SESSION_DB_USERNAME_DEV}:${process.env.SESSION_DB_PASSWORD_DEV}@cluster0.bihud.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
  await mongoose.connect(mongoUrl);
  console.log("MongoDB Connected");

  app.use(
    session({
      name: COOKIE_NAME,
      store: MongoStore.create({ mongoUrl }),
      cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true, // JS front end cannot access the cookie
        secure: __prod__, // cooke only works in https
        sameSite: "lax",
        domain: __prod__ ? ".vercel.app" : undefined,
      },
      secret: process.env.SESSION_SECRET_DEV_PROD as string,
      saveUninitialized: false, // don't save empty sessions, right from the start
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }): Context => ({
      req,
      res,
      connection,
      dataLoaders: buildDataLoaders(),
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(
      `Server started on port ${PORT}. GraphQL server started on localhost:${PORT}${apolloServer.graphqlPath}`
    )
  );
};

main().catch((error) => console.log(error));
