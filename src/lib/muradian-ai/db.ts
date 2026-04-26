import { getMongoDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

export interface AIChatSession {
  _id?: ObjectId;
  userId: string;
  title: string;
  messages: AIChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export async function saveChatSession(userId: string, title: string, messages: AIChatMessage[], sessionId?: string) {
  const db = await getMongoDb();
  const now = new Date();
  
  if (sessionId) {
    return db.collection<AIChatSession>("ai_chat_sessions").updateOne(
      { _id: new ObjectId(sessionId), userId },
      { $set: { title, messages, updatedAt: now } }
    );
  } else {
    return db.collection<AIChatSession>("ai_chat_sessions").insertOne({
      userId,
      title,
      messages,
      createdAt: now,
      updatedAt: now
    });
  }
}

export async function getChatSessions(userId: string) {
  const db = await getMongoDb();
  return db.collection<AIChatSession>("ai_chat_sessions")
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function getChatSessionById(userId: string, sessionId: string) {
  const db = await getMongoDb();
  return db.collection<AIChatSession>("ai_chat_sessions").findOne({
    _id: new ObjectId(sessionId),
    userId
  });
}

export async function deleteChatSession(userId: string, sessionId: string) {
  const db = await getMongoDb();
  return db.collection<AIChatSession>("ai_chat_sessions").deleteOne({
    _id: new ObjectId(sessionId),
    userId
  });
}
