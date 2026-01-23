import { GoogleGenerativeAI } from '@google/generative-ai';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import firestore from './firestore.js'; // Import firestore to get user servers
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const logPath = path.join(process.cwd(), 'debug_llm.log');
try {
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] Loading gemini.ts\n`);
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] GEMINI_API_KEY at top level: ${process.env.GEMINI_API_KEY ? 'PRESENT' : 'MISSING'}\n`);
} catch (e) {
  // ignore
}

/**
 * LLM service that calls Gemini when configured via env.
 * If not configured, returns a simple echo response for development.
 */

export const generateBotResponse = async (messages: Array<{ id: string, created_at: string, sender: string, text: string }>, userId?: string) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return "DEBUG ERROR: GEMINI_API_KEY is missing!";
  }

  // Store clients to close them later
  const activeClients: { client: Client, transport: StreamableHTTPClientTransport, tools: any[] }[] = [];

  try {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] Initializing Gemini & MCP... User: ${userId}\n`);

    // 1. Fetch User's MCP Servers
    let allTools: any[] = [];
    if (userId) {
      try {
        const userServers = await firestore.getUserMcpServers(userId);
        if (userServers && userServers.length > 0) {
          fs.appendFileSync(logPath, `[${new Date().toISOString()}] Found ${userServers.length} MCP servers for user\n`);

          for (const server of userServers) {
            try {
              const transport = new StreamableHTTPClientTransport(
                server.url.trim(),
                {
                  // @ts-ignore
                  headers: {
                    "Content-Type": "application/json",
                    ...(server.apiKey ? { "x-api-key": server.apiKey } : {})
                  }
                }
              );
              const client = new Client(
                { name: "botbridge-backend", version: "1.0.0" },
                { capabilities: {} }
              );

              // Connect
              await client.connect(transport as any);

              // Fetch tools
              const { tools } = await client.listTools();

              // Store client reference for execution later
              activeClients.push({ client, transport, tools });

              // Add to allTools with reference to which client owns it
              // We map them here to preserve the client association if needed, 
              // but Gemini needs unique names. We assume tool names are unique or acceptable as is.
              allTools.push(...tools.map(t => ({ ...t, _clientIndex: activeClients.length - 1 })));

              fs.appendFileSync(logPath, `[${new Date().toISOString()}] Connected to ${server.name || server.url}, fetched ${tools.length} tools\n`);
            } catch (connErr: any) {
              fs.appendFileSync(logPath, `[${new Date().toISOString()}] Failed to connect to MCP server ${server.url}: ${connErr.message}\n`);
              // Continue to next server even if one fails
            }
          }
        } else {
          fs.appendFileSync(logPath, `[${new Date().toISOString()}] No MCP servers configured for user\n`);
        }
      } catch (dbErr: any) {
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Error fetching user MCP servers: ${dbErr.message}\n`);
      }
    }

    // Aggressive cleanup for Gemini Schema
    // Gemini does NOT support: additionalProperties, title, examples, default, const, anyOf with incompatible types
    // Gemini expects 'type' to be a string, not an array.

    // Type mapping helper
    const mapType = (t: any): string | undefined => {
      if (typeof t === 'string') return t;
      if (Array.isArray(t) && t.length > 0) return t[0]; // Take first type if array
      return undefined;
    };

    const cleanSchema = (schema: any): any => {
      if (schema === null || typeof schema !== 'object') {
        return schema;
      }

      // Handle Array of schemas
      if (Array.isArray(schema)) {
        return schema.map(cleanSchema);
      }

      const newSchema: any = {};

      // 1. Handle Type
      if (schema.type) {
        newSchema.type = mapType(schema.type);
        // If type became undefined (e.g. empty array), default to string or object depending on props
        if (!newSchema.type) {
          if (schema.properties) newSchema.type = 'object';
          else if (schema.items) newSchema.type = 'array';
          else newSchema.type = 'string';
        }
      } else {
        // Infer type
        if (schema.properties) newSchema.type = 'object';
        else if (schema.items) newSchema.type = 'array';
        // else leave undefined, Gemini might infer or it might be optional
      }

      // 2. Handle Properties (Recursive)
      if (schema.properties) {
        newSchema.properties = {};
        for (const key in schema.properties) {
          newSchema.properties[key] = cleanSchema(schema.properties[key]);
        }
      }

      // 3. Handle Array Items
      if (schema.items) {
        newSchema.items = cleanSchema(schema.items);
      }

      // 4. Handle Enum
      if (schema.enum) {
        newSchema.enum = schema.enum;
      }

      // 5. Handle Required
      if (schema.required) {
        newSchema.required = schema.required;
      }

      // 6. Handle Description
      if (schema.description) {
        newSchema.description = schema.description;
      }

      // 7. Handle Format (optional, but good to keep)
      if (schema.format) {
        newSchema.format = schema.format;
      }

      // 8. Handle nullable (if present in some specs, map to nullable bool if acceptable, or ignore)
      // Gemini usually handles nullability via 'nullable: true' field in simpler schemas, 
      // but strictly speaking standard JSON schema uses type: ["string", "null"]. 
      // We mapped type array to single type above. 
      // If original type had "null", we theoretically should set nullable: true, 
      // but let's keep it simple for now as 'nullable' isn't always supported in all SDK versions efficiently.

      // EXPLICITLY REMOVE:
      // additionalProperties, title, examples, default, const, anyOf, oneOf, allOf (unless we prefer to simplify them)

      // 9. Simplified handling for anyOf/oneOf: Try to take the first valid schema or merge
      // This is often where things break. If we have anyOf: [{type: string}, {type: integer}], 
      // Gemini doesn't easily support this without specific 'Union' types which might not be exposed easily.
      // Best bet for robustness: If properties missing, try to treat as the first option.
      if (!newSchema.properties && !newSchema.items && !newSchema.type) {
        if (schema.anyOf && schema.anyOf.length > 0) {
          return cleanSchema(schema.anyOf[0]);
        }
        if (schema.oneOf && schema.oneOf.length > 0) {
          return cleanSchema(schema.oneOf[0]);
        }
      }

      return newSchema;
    };

    // 2. Map to Gemini FunctionDeclarations
    // MCP Tool: { name, description, inputSchema }
    // Gemini: { name, description, parameters }
    const functionDeclarations = allTools.map((t: any) => {
      return {
        name: t.name,
        description: t.description || "No description provided",
        parameters: cleanSchema(t.inputSchema || ({} as Record<string, unknown>)),
      };
    });

    if (functionDeclarations.length === 0) {
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] Warning: No valid function declarations mapped.\n`);
    } else {
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] Mapped ${functionDeclarations.length} tools for Gemini\n`);
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const modelOptions: any = {
      model: "gemini-2.5-flash-lite", // Reverting to 2.0-flash as confirmed stable
      systemInstruction: "You are an MCP client named as BotBridge. You perform digital actions using the connected tools."
    };
    if (functionDeclarations.length > 0) {
      modelOptions.tools = [{ functionDeclarations }];
    }

    const model = genAI.getGenerativeModel(modelOptions);

    // 3. Convert history
    const history = messages.slice(0, -1).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const chat = model.startChat({ history });

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.sender !== 'user') return "Error: Invalid last message";

    // Helper for rate limit retries
    const sendMessageWithRetry = async (chatSession: any, msg: any, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await chatSession.sendMessage(msg);
        } catch (error: any) {
          const isRateLimit = error.message.includes('429') || error.message.includes('Too Many Requests') || error.message.includes('Quota exceeded');
          if (isRateLimit && i < maxRetries - 1) {
            const waitTime = 2000 * Math.pow(2, i); // 2s, 4s, 8s...
            const logMsg = `[${new Date().toISOString()}] Rate limit 429 hit. Retrying in ${waitTime / 1000}s (Attempt ${i + 1}/${maxRetries})...\n`;
            console.log(logMsg);
            fs.appendFileSync(logPath, logMsg);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          throw error;
        }
      }
    };

    fs.appendFileSync(logPath, `[${new Date().toISOString()}] Sending logic: "${lastMsg.text}"\n`);
    let result = await sendMessageWithRetry(chat, lastMsg.text);

    // 4. Function Calling Loop
    while (true) {
      const response = await result.response;
      const functionCalls = response.functionCalls();

      if (functionCalls && functionCalls.length > 0) {
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Model requested ${functionCalls.length} function calls\n`);
        const parts: any[] = [];

        for (const call of functionCalls) {
          fs.appendFileSync(logPath, `[${new Date().toISOString()}] Executing: ${call.name}\n`);
          try {
            // Find which client owns this tool
            const toolClientInfo = activeClients.find(c => c.tools.some(t => t.name === call.name));

            if (!toolClientInfo) {
              throw new Error(`Client for tool ${call.name} not found`);
            }

            // Execute via MCP Client
            const actionResult = await toolClientInfo.client.callTool({
              name: call.name,
              arguments: call.args as any
            });

            fs.appendFileSync(logPath, `[${new Date().toISOString()}] Result: ${JSON.stringify(actionResult)}\n`);

            parts.push({
              functionResponse: {
                name: call.name,
                response: actionResult // Gemini expects object
              }
            });
          } catch (execErr: any) {
            console.error("Tool execution failed", execErr);
            parts.push({
              functionResponse: {
                name: call.name,
                response: { error: execErr.message || "Failed to execute" }
              }
            });
          }
        }
        // Send tool results back to model
        result = await sendMessageWithRetry(chat, parts);
      } else {
        // No function calls, just text response
        break;
      }
    }

    const finalResponse = (await result.response).text();
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] Final response: "${finalResponse.substring(0, 50)}..."\n`);

    // Cleanup clients
    for (const c of activeClients) {
      try { await c.transport.close(); } catch (e) { /* ignore */ }
    }

    return finalResponse;

  } catch (e: any) {
    // Cleanup clients on error
    for (const c of activeClients) {
      try { await c.transport.close(); } catch (clErr) { /* ignore */ }
    }

    const errMsg = e?.message || e;
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ERROR: ${errMsg}\n`);
    console.error('Gemini+MCP Error:', errMsg);
    return `Error processing request: ${errMsg}`;
  }
};
