import { getMongoDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

import { ShareProfileTab, ShareProfileSettings } from "@/lib/shareProfile";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  verified: boolean;
  createdAt: Date;
}

export interface TokenUsage {
  userId: string;
  month: string; // Format: YYYY-MM
  tokensUsed: number;
}

export interface VerifyCode {
  email: string;
  code: string;
  expiresAt: Date;
}

export interface UserData {
  userId: string;
  tabs: ShareProfileTab[];
  settings: ShareProfileSettings;
  updatedAt: Date;
}

export interface UserMemoryProfile {
  userId: string;
  memory: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getMongoDb();
  return db.collection<User>("users").findOne({ email });
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
): Promise<void> {
  const db = await getMongoDb();
  await db.collection<User>("users").insertOne({
    name,
    email,
    passwordHash,
    verified: false,
    createdAt: new Date(),
  });
}

export async function getUserTokenUsage(
  userId: string,
  month: string,
): Promise<number> {
  const db = await getMongoDb();
  const record = await db
    .collection<TokenUsage>("token_usage")
    .findOne({ userId, month });
  return record?.tokensUsed || 0;
}

export async function incrementTokenUsage(
  userId: string,
  month: string,
  tokens: number,
): Promise<void> {
  const db = await getMongoDb();
  await db
    .collection<TokenUsage>("token_usage")
    .updateOne(
      { userId, month },
      { $inc: { tokensUsed: tokens } },
      { upsert: true },
    );
}

export async function verifyUser(email: string): Promise<void> {
  const db = await getMongoDb();
  await db
    .collection<User>("users")
    .updateOne({ email }, { $set: { verified: true } });
}

export async function saveVerifyCode(
  email: string,
  code: string,
  expiresAt: Date,
): Promise<void> {
  const db = await getMongoDb();
  await db
    .collection<VerifyCode>("verify_codes")
    .updateOne({ email }, { $set: { code, expiresAt } }, { upsert: true });
}

export async function getVerifyCode(email: string): Promise<VerifyCode | null> {
  const db = await getMongoDb();
  return db.collection<VerifyCode>("verify_codes").findOne({ email });
}

export async function deleteVerifyCode(email: string): Promise<void> {
  const db = await getMongoDb();
  await db.collection<VerifyCode>("verify_codes").deleteOne({ email });
}

export async function getUserMemoryProfile(
  userId: string,
): Promise<UserMemoryProfile | null> {
  const db = await getMongoDb();
  return db
    .collection<UserMemoryProfile>("user_memory_profiles")
    .findOne({ userId });
}

export async function upsertUserMemoryProfile(
  userId: string,
  memory: string,
): Promise<void> {
  const db = await getMongoDb();
  const now = new Date();

  await db.collection<UserMemoryProfile>("user_memory_profiles").updateOne(
    { userId },
    {
      $set: {
        userId,
        memory,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );
}
