import express from 'express';
import verifyFirebaseToken from '../middlewares/auth.js';
import firestore from '../services/firestore.js';

const router = express.Router();

router.post('/', verifyFirebaseToken, async (req: any, res) => {
  const uid = req.uid;
  const chat = await firestore.createChat(uid);
  res.json({ chat });
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

export default router;
