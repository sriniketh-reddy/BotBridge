import { firestore } from '../config/firebase.js';

const usersCollection = firestore.collection('users');
// const mcpCollection = firestore.collection('mcp_servers');
// const chatsCollection = firestore.collection('chats');

export const getUser = async (uid: string) => {
  console.debug('[firestore] getUser', uid);
  const doc = await usersCollection.doc(uid).get();
  const result = doc.exists ? { id: doc.id, ...doc.data() } : null;
  console.debug('[firestore] getUser result', !!result);
  return result;
};

export const createUser = async (uid: string, payload: any) => {
  const now = new Date().toISOString();
  const data = { ...payload, created_at: now, updated_at: now };
  console.debug('[firestore] createUser', uid, payload);
  await usersCollection.doc(uid).set(data, { merge: true });
  console.debug('[firestore] createUser done', uid);
  return { id: uid, ...data };
};

export const getUserMcpServers = async (uid: string) => {
  console.debug('[firestore] getUserMcpServers', uid);
  const sub = await usersCollection.doc(uid).collection('user_mcp_servers').get();
  const res = sub.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  console.debug('[firestore] getUserMcpServers count', res.length);
  return res;
};

export const createMcpServer = async (userId: string, name: string, url: string, tools: any[] = []) => {
  console.debug('[firestore] createMcpServer', url);
  const ref = await usersCollection.doc(userId).collection('user_mcp_servers').doc();
  await ref.set({ name, url, tools, created_at: new Date().toISOString() });
  console.debug('[firestore] createMcpServer done', ref.id);
  return { id: ref.id, name, url, tools };
};

export const deleteMcpServer = async (userId: string, mcpServerId: string) => {
  console.debug('[firestore] deleteMcpServer', mcpServerId);
  await usersCollection.doc(userId).collection('user_mcp_servers').doc(mcpServerId).delete();
  console.debug('[firestore] deleteMcpServer done', mcpServerId);
};

export const createChat = async (userId: string) => {
  const now = new Date().toISOString();
  const ref = await usersCollection.doc(userId).collection('user_chats').doc();
  await ref.set({ chat_name: "Chats", created_at: now, updated_at: now });
  return { id: ref.id };
};

export const getUserChats = async (userId: string) => {
  console.debug('[firestore] getUserChats', userId);
  const sub = await usersCollection.doc(userId).collection('user_chats').orderBy('updated_at', 'desc').get();
  const res = sub.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  console.debug('[firestore] getUserChats count', res.length);
  return res;
};

export const renameChat = async (userId: string, chatId: string, newName: string) => {
  console.debug('[firestore] renameChat', userId, chatId, newName);
  await usersCollection.doc(userId).collection('user_chats').doc(chatId).update({ chat_name: newName, updated_at: new Date().toISOString() });
  return { id: chatId, chat_name: newName };
};

export const addMessage = async (userId: string, chatId: string, sender: string, text: string) => {
  const messages = usersCollection.doc(userId).collection('user_chats').doc(chatId).collection('messages');
  const msgRef = messages.doc();
  const now = new Date().toISOString();
  await msgRef.set({ sender, text, created_at: now });
  await usersCollection.doc(userId).collection('user_chats').doc(chatId).update({ updated_at: now });
  return { id: msgRef.id, sender, text, created_at: now };
};

export const getChatMessages = async (userId: string, chatId: string) => {
  const snapshot = await usersCollection.doc(userId).collection('user_chats').doc(chatId).collection('messages').orderBy('created_at', 'asc').get();
  return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
};

export const deleteChat = async (userId: string, chatId: string) => {
  console.debug('[firestore] unlinkUserChatAndEnsure', userId, chatId);
  await usersCollection.doc(userId).collection('user_chats').doc(chatId).delete();
  const remaining = await getUserChats(userId);
  if (!remaining || remaining.length === 0) {
    console.debug('[firestore] no remaining chats for user, creating new one', userId);
    const newChat = await createChat(userId);
    return { created: true, newChat };
  }
  return { created: false };
};

export default {
  getUser,
  createUser,
  getUserMcpServers,
  createMcpServer,
  deleteMcpServer,
  createChat,
  getUserChats,
  renameChat,
  addMessage,
  getChatMessages,
  deleteChat,
};
