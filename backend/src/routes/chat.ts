import express from 'express';
import verifyFirebaseToken from '../middlewares/auth.js';
import firestore from '../services/firestore.js';
import { generateBotResponse } from '../services/gemini.js';

const router = express.Router();


router.post('/', verifyFirebaseToken, async (req: any, res) => {
  const uid = req.uid;
  const chat = await firestore.createChat(uid);
  res.json({ chat });
});

router.get('/', verifyFirebaseToken, async (req: any, res) => {
  const uid = req.uid;
  const chats = await firestore.getUserChats(uid);
  console.log(chats);
  res.json({ chats });
});

router.get('/:chatId/messages', verifyFirebaseToken, async (req: any, res) => {
  const uid = req.uid;
  const { chatId } = req.params;
  const msgs = await firestore.getChatMessages(uid, chatId);
  res.json({ messages: msgs });
});

router.post('/:chatId/messages', verifyFirebaseToken, async (req: any, res) => {
  console.log('[CHAT ROUTE] ===== ROUTE HIT =====');
  const { chatId } = req.params;
  const { text } = req.body;
  const { uid } = req;
  console.log('[CHAT ROUTE] Received message:', text);
  const added = await firestore.addMessage(uid, chatId, 'user', text);
  // fetch recent messages to build context
  const msgs = await firestore.getChatMessages(uid, chatId);
  console.log('[CHAT ROUTE] Fetched messages:', msgs.length);
  console.log('[CHAT ROUTE] About to call generateBotResponse');
  const botResp = await generateBotResponse(msgs, req.uid);
  console.log('[CHAT ROUTE] Got bot response:', botResp?.substring(0, 50));
  const botAdded = await firestore.addMessage(uid, chatId, 'bot', String(botResp));
  res.json({ message: added, bot: botAdded });
});

// delete a chat for the authenticated user
router.delete('/:chatId', verifyFirebaseToken, async (req: any, res) => {
  const { chatId } = req.params;
  const uid = req.uid;
  try {
    const result = await firestore.deleteChat(uid, chatId);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('delete chat error', err);
    return res.status(500).json({ error: 'Failed to delete chat', detail: String(err) });
  }
});

// rename a chat
router.put('/:chatId', verifyFirebaseToken, async (req: any, res) => {
  const { chatId } = req.params;
  const { name } = req.body;
  const uid = req.uid;
  try {
    const result = await firestore.renameChat(uid, chatId, name);
    return res.json({ success: true, chat: result });
  } catch (err) {
    console.error('rename chat error', err);
    return res.status(500).json({ error: 'Failed to rename chat', detail: String(err) });
  }
});

export default router;
