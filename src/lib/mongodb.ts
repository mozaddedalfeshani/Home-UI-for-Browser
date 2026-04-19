import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

const options = {
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 15_000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (process.env.NODE_ENV === "development") {
  if (!globalForMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalForMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalForMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export const getMongoClient = async () => clientPromise;

export const getMongoDb = async () => {
  const mongoClient = await clientPromise;
  return mongoClient.db("home_ui_analytics");
};
