import { MongoClient } from "mongodb";

const url = "mongodb+srv://9503chl:ehdcns12!@cluster0.y86t7.mongodb.net/forum?retryWrites=true&w=majority&appName=Cluster0";

const options = {};

let connectDB: Promise<MongoClient>;

declare global {
  var _mongo: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongo) {
    global._mongo = new MongoClient(url, options).connect();
  }
  connectDB = global._mongo;
} else {
  connectDB = new MongoClient(url, options).connect();
}

export { connectDB };
