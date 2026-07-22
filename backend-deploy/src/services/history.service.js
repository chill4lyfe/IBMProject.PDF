import { Session } from "../models/session.model.js";

export const saveMessage = async (sessionId, role, content) => {
  await Session.findByIdAndUpdate(sessionId, {
    $push: { 
      history: { role, content } 
    }
  });
};

export const getHistory = async (sessionId) => {
  const session = await Session.findById(sessionId).lean();
  if (!session || !session.history) return [];
  return session.history.map(msg => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp
  }));
};

export const deleteHistory = async (sessionId) => {
  // Clears the history array but keeps the session and documents intact
  await Session.findByIdAndUpdate(sessionId, {
    $set: { history: [] }
  });
};