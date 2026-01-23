import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

const fetchTools = async (mcpUrl: string, apiKey?: string) => {
  let transport;
  let client;
  const cleanUrl = mcpUrl.trim();

  try {
    console.log(`[mcp.ts] Connecting to MCP server: ${cleanUrl} (API Key: ${apiKey ? 'Present' : 'Missing'})`);

    transport = new StreamableHTTPClientTransport(
      new URL(cleanUrl),
      {
        // @ts-ignore
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {})
        }
      }
    );
    client = new Client(
      { name: "botbridge-backend", version: "1.0.0" },
      { capabilities: {} }
    );

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out after 15s')), 15000)
    );

    // Race connection against timeout
    await Promise.race([
      client.connect(transport as Transport),
      timeoutPromise
    ]);

    const result = await client.listTools();
    console.log(`[mcp.ts] Fetched ${result.tools.length} tools`);

    // Close connection after fetching
    await transport.close();

    return result.tools;
  } catch (e: any) {
    console.error(`[mcp.ts] Failed to fetch tools from ${cleanUrl}:`, e.message);
    // Cleanup if error occurred during connection
    if (transport) {
      try { await transport.close(); } catch (clErr) { /* ignore */ }
    }
    throw e;
  }
};

export default { fetchTools };