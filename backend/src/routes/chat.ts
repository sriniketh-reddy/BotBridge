import express from 'express';
import verifyFirebaseToken from '../middlewares/auth.js';
import firestore from '../services/firestore.js';

const router = express.Router();

router.post('/', verifyFirebaseToken, async (req: any, res) => {
  const uid = req.uid;
  const chat = await firestore.createChat(uid);
  res.json({ chat });
});

router.get('/', verifyFirebaseToken, async (req: any, res) => {
  const uid = req.uid;
  const chats = await firestore.getUserChats(uid);
  res.json({ chats });
});

router.get('/:chatId/messages', verifyFirebaseToken, async (req: any, res) => {
  const { chatId } = req.params;
  const msgs = await firestore.getChatMessages(chatId);
  res.json({ messages: msgs });
});

router.post('/:chatId/messages', verifyFirebaseToken, async (req: any, res) => {
  const { chatId } = req.params;
  const { text } = req.body;
  const added = await firestore.addMessage(chatId, 'user', text);
  // fetch recent messages to build context
  const msgs = await firestore.getChatMessages(chatId);
  const botResp = await (await import('../services/llm.js')).generateBotResponse(msgs, req.uid);
  const botAdded = await firestore.addMessage(chatId, 'bot', String(botResp));
  res.json({ message: added, bot: botAdded });
});

// delete a chat for the authenticated user
router.delete('/:chatId', verifyFirebaseToken, async (req: any, res) => {
  const { chatId } = req.params;
  const uid = req.uid;
  try {
    const result = await (await import('../services/firestore.js')).unlinkUserChatAndEnsure(uid, chatId);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('delete chat error', err);
    return res.status(500).json({ error: 'Failed to delete chat', detail: String(err) });
  }
});

export default router;
