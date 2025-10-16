import express from 'express';
import verifyFirebaseToken from '../middlewares/auth.js';
import { createMcpServer, addUserMcpServer } from '../services/firestore.js';
import { deleteMcpServer, unlinkUserMcpServer } from '../services/firestore.js';

const router = express.Router();

// Create MCP server and optionally link to user
router.post('/', verifyFirebaseToken, async (req: any, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  const mcp = await createMcpServer(url);
  if (req.uid) await addUserMcpServer(req.uid, mcp.id);
  res.json({ mcp });
});

// List current user's MCP servers
router.get('/', verifyFirebaseToken, async (req: any, res) => {
  const uid = req.uid;
  if (!uid) return res.status(401).json({ error: 'Not authenticated' });
  const sub = await (await import('../services/firestore.js')).getUserMcpServers(uid);
  res.json({ servers: sub });
});

// Delete an MCP server (only allowed for authenticated users)
router.delete('/:id', verifyFirebaseToken, async (req: any, res) => {
  const uid = req.uid;
  if (!uid) return res.status(401).json({ error: 'Not authenticated' });
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    // remove user's link
    await unlinkUserMcpServer(uid, id);
    // delete the server document (might remove references for others as well)
    await deleteMcpServer(id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete mcp', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
