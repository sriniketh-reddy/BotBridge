import { firestore } from '../config/firebase.js';

const usersCollection = firestore.collection('users');
const mcpCollection = firestore.collection('mcp_servers');
const chatsCollection = firestore.collection('chats');

export const getUser = async (uid: string) => {
  const doc = await usersCollection.doc(uid).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const createUser = async (uid: string, payload: any) => {
  const now = new Date().toISOString();
  const data = { ...payload, created_at: now, updated_at: now };
  await usersCollection.doc(uid).set(data, { merge: true });
  return { id: uid, ...data };
};

export const addUserMcpServer = async (uid: string, mcpServerId: string) => {
  const sub = usersCollection.doc(uid).collection('user_mcp_servers');
  await sub.doc(mcpServerId).set({ mcp_server_id: mcpServerId, created_at: new Date().toISOString() });
};

export const getUserMcpServers = async (uid: string) => {
  const sub = await usersCollection.doc(uid).collection('user_mcp_servers').get();
  return sub.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }));
};

export const createMcpServer = async (url: string) => {
  const ref = mcpCollection.doc();
  await ref.set({ url, created_at: new Date().toISOString() });
  return { id: ref.id, url };
};

export const deleteMcpServer = async (mcpServerId: string) => {
  // delete the mcp server doc
  await mcpCollection.doc(mcpServerId).delete();
  // remove references from all users' subcollections
  const usersSnapshot = await usersCollection.get();
  const batch = firestore.batch();
  usersSnapshot.docs.forEach((u: FirebaseFirestore.QueryDocumentSnapshot) => {
    const ref = usersCollection.doc(u.id).collection('user_mcp_servers').doc(mcpServerId);
    batch.delete(ref);
  });
  await batch.commit();
};

export const unlinkUserMcpServer = async (uid: string, mcpServerId: string) => {
  const ref = usersCollection.doc(uid).collection('user_mcp_servers').doc(mcpServerId);
  await ref.delete();
};

export const createChat = async (userId: string) => {
  const chatRef = chatsCollection.doc();
  await chatRef.set({ created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  // link to user
  await usersCollection.doc(userId).collection('user_chats').doc(chatRef.id).set({ chat_id: chatRef.id, created_at: new Date().toISOString() });
  return { id: chatRef.id };
};

export const addMessage = async (chatId: string, sender: string, text: string) => {
  const messages = chatsCollection.doc(chatId).collection('messages');
  const msgRef = messages.doc();
  const now = new Date().toISOString();
  await msgRef.set({ sender, text, created_at: now });
  await chatsCollection.doc(chatId).update({ updated_at: now });
  return { id: msgRef.id, sender, text, created_at: now };
};

export const getChatMessages = async (chatId: string) => {
  const snapshot = await chatsCollection.doc(chatId).collection('messages').orderBy('created_at', 'asc').get();
  return snapshot.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }));
};

export default {
  getUser,
  createUser,
  addUserMcpServer,
  createMcpServer,
  createChat,
  addMessage,
  getChatMessages,
};
