import { getMongoDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface MuradianAskAgentDocument {
  _id?: ObjectId;
  userId: string;
  name: string;
  description: string;
  systemInstruction: string;
  visibility?: MuradianAskAgentVisibility;
  createdAt: Date;
  updatedAt: Date;
}

export type MuradianAskAgentVisibility = "private" | "public";

export interface MuradianAskAgentPayload {
  name: string;
  description: string;
  systemInstruction: string;
  visibility: MuradianAskAgentVisibility;
}

const collectionName = "muradian_ask_agents";

export async function getMuradianAskAgents(userId: string) {
  const db = await getMongoDb();

  return db
    .collection<MuradianAskAgentDocument>(collectionName)
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function getMuradianAskAgentById(userId: string, agentId: string) {
  if (!ObjectId.isValid(agentId)) {
    return null;
  }

  const db = await getMongoDb();

  return db.collection<MuradianAskAgentDocument>(collectionName).findOne({
    _id: new ObjectId(agentId),
    userId,
  });
}

export async function getMuradianAskAgentForUse(
  userId: string,
  agentId: string,
) {
  if (!ObjectId.isValid(agentId)) {
    return null;
  }

  const db = await getMongoDb();

  return db.collection<MuradianAskAgentDocument>(collectionName).findOne({
    _id: new ObjectId(agentId),
    $or: [{ userId }, { visibility: "public" }],
  });
}

export async function searchPublicMuradianAskAgents(
  userId: string,
  query: string,
) {
  const db = await getMongoDb();
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const searchRegex = new RegExp(escapedQuery, "i");

  return db
    .collection<MuradianAskAgentDocument>(collectionName)
    .find({
      userId: { $ne: userId },
      visibility: "public",
      $or: [{ name: searchRegex }, { description: searchRegex }],
    })
    .sort({ updatedAt: -1 })
    .limit(8)
    .toArray();
}

export async function createMuradianAskAgent(
  userId: string,
  payload: MuradianAskAgentPayload,
) {
  const db = await getMongoDb();
  const now = new Date();

  return db.collection<MuradianAskAgentDocument>(collectionName).insertOne({
    userId,
    ...payload,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateMuradianAskAgent(
  userId: string,
  agentId: string,
  payload: MuradianAskAgentPayload,
) {
  const db = await getMongoDb();

  return db.collection<MuradianAskAgentDocument>(collectionName).updateOne(
    { _id: new ObjectId(agentId), userId },
    {
      $set: {
        ...payload,
        updatedAt: new Date(),
      },
    },
  );
}

export async function deleteMuradianAskAgent(userId: string, agentId: string) {
  const db = await getMongoDb();

  return db.collection<MuradianAskAgentDocument>(collectionName).deleteOne({
    _id: new ObjectId(agentId),
    userId,
  });
}
