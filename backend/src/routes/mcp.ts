import express from 'express';
import verifyFirebaseToken from '../middlewares/auth.js';
import firestore from '../services/firestore.js';
import mcpClient from '../services/mcp.js';

const router = express.Router();

// Create MCP server and optionally link to user
router.post('/', verifyFirebaseToken, async (req: any, res) => {
  const { url, name, apiKey } = req.body;
  const { uid } = req;

  if (!url) return res.status(400).json({ error: 'url required' });

  // Duplicate Check
  const existing = await firestore.getUserMcpServers(uid);
  if (existing.find((s: any) => s.url === url)) {
    return res.status(400).json({ error: 'MCP server is already present' });
  }

  // Fetch Tools
  let tools;
  try {
    tools = await mcpClient.fetchTools(url, apiKey);
    console.log("Tools fetched:", tools.length);
  } catch (err: any) {
    console.error("Error fetching tools:", err.message);
    return res.status(400).json({ error: 'Invalid MCP server address or connection failed' });
  }

  // Validate Tools
  if (!tools || tools.length === 0) {
    return res.status(400).json({ error: 'Invalid server: failed to fetch tools or no tools available' });
  }

  // Map Tools Schema
  // User requested: [{"toolname": "", "description": "", "parameter_list":[]}]
  const mappedTools = tools.map((t: any) => ({
    toolname: t.name || 'Unknown',
    description: t.description || 'No description',
    parameter_list: t.inputSchema || {}
  }));

  const mcp = await firestore.createMcpServer(uid, name, url, mappedTools, apiKey);
  res.json({ mcp: { ...mcp, tools: mappedTools } });
});

// List current user's MCP servers
router.get('/', verifyFirebaseToken, async (req: any, res) => {
  const uid = req.uid;
  if (!uid) return res.status(401).json({ error: 'Not authenticated' });
  const sub = await firestore.getUserMcpServers(uid);
  res.json({ servers: sub });
});

// Delete an MCP server (only allowed for authenticated users)
router.delete('/:id', verifyFirebaseToken, async (req: any, res) => {
  const { uid } = req;
  if (!uid) return res.status(401).json({ error: 'Not authenticated' });
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    // remove user's link
    // await unlinkUserMcpServer(uid, id);
    // delete the server document (might remove references for others as well)
    console.log('Deleting MCP server', id, 'for user', uid);
    await firestore.deleteMcpServer(uid, id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete mcp', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});



export default router;
