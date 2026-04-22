import { getMongoDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  verified: boolean;
  createdAt: Date;
}

export interface VerifyCode {
  email: string;
  code: string;
  expiresAt: Date;
}

export interface UserData {
  userId: string;
  tabs: any[];
  settings: any;
  updatedAt: Date;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getMongoDb();
  return db.collection<User>("users").findOne({ email });
}

export async function createUser(email: string, passwordHash: string): Promise<void> {
  const db = await getMongoDb();
  await db.collection<User>("users").insertOne({
    email,
    passwordHash,
    verified: false,
    createdAt: new Date(),
  });
}

export async function verifyUser(email: string): Promise<void> {
  const db = await getMongoDb();
  await db.collection<User>("users").updateOne(
    { email },
    { $set: { verified: true } }
  );
}

export async function saveVerifyCode(email: string, code: string, expiresAt: Date): Promise<void> {
  const db = await getMongoDb();
  await db.collection<VerifyCode>("verify_codes").updateOne(
    { email },
    { $set: { code, expiresAt } },
    { upsert: true }
  );
}

export async function getVerifyCode(email: string): Promise<VerifyCode | null> {
  const db = await getMongoDb();
  return db.collection<VerifyCode>("verify_codes").findOne({ email });
}

export async function deleteVerifyCode(email: string): Promise<void> {
  const db = await getMongoDb();
  await db.collection<VerifyCode>("verify_codes").deleteOne({ email });
}
