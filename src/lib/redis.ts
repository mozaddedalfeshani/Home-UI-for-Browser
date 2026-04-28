import { createClient, type RedisClientType } from "redis";

const redisUrl = process.env.REDIS_URL;

const globalForRedis = globalThis as typeof globalThis & {
  _redisClient?: RedisClientType;
  _redisClientPromise?: Promise<RedisClientType>;
};

export const getRedisClient = async () => {
  if (!redisUrl) {
    return null;
  }

  if (!globalForRedis._redisClient) {
    const client = createClient({ url: redisUrl });

    client.on("error", (error) => {
      console.error("Redis connection error", error);
    });

    globalForRedis._redisClient = client as RedisClientType;
    globalForRedis._redisClientPromise = client
      .connect()
      .then(() => client as RedisClientType);
  }

  try {
    return await globalForRedis._redisClientPromise!;
  } catch (error) {
    console.error("Failed to connect to Redis", error);
    return null;
  }
};
