import { getMongoDb } from "@/lib/mongodb";
import { UserData } from "./db";

export async function pushUserData(userId: string, data: { tabs: any[]; settings: any }): Promise<void> {
  const db = await getMongoDb();
  await db.collection<UserData>("user_data").updateOne(
    { userId },
    { 
      $set: { 
        tabs: data.tabs, 
        settings: data.settings, 
        updatedAt: new Date() 
      } 
    },
    { upsert: true }
  );
}

export async function pullUserData(userId: string): Promise<UserData | null> {
  const db = await getMongoDb();
  return db.collection<UserData>("user_data").findOne({ userId });
}
