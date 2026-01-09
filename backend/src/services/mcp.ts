import axios from 'axios';
import dotenv from 'dotenv';
import { createParser } from 'eventsource-parser';

dotenv.config();

// NOTE: the function name is intentionally miss‑spelled as `fecthTools` because the rest of the codebase imports it with that name.
const fecthTools = async (mcpUrl: string) => {
  try {
    const tools: Array<any> = [];
    const body = {
      method: "tools/list",
      params: {},
      id: "botbridge",
      jsonrpc: "2.0",
    };

    const resp = await axios.post(mcpUrl, body, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Connection": "close",
        // Composio API key from environment variable
        "Authorization": `Bearer ${process.env.COMPOSIO_API_KEY}`,
      },
      // We request a stream, but some endpoints may return plain JSON.
      responseType: "stream",
      timeout: 20000,
    });

    // Determine response type based on Content‑Type header
    const contentType = (resp.headers as any)["content-type"] as string;
    if (contentType && contentType.includes("application/json") && !contentType.includes("text/event-stream")) {
      // Plain JSON response – axios already parsed it
      const json = resp.data;
      if (json?.result?.tools) {
        console.log("✅ Tools received (JSON):", json.result.tools);
        tools.push(...json.result.tools);
      }
    } else {
      // SSE stream handling
      const parser = createParser({
        onEvent(event: any) {
          if (event.type === "event" && "data" in event && event.data) {
            try {
              const json = JSON.parse(event.data);
              if (json.result?.tools) {
                console.log("✅ Tools received (SSE):", json.result.tools);
                tools.push(...json.result.tools);
              }
            } catch {
              console.warn("⚠️ Invalid JSON chunk");
            }
          }
        },
      });

      // Feed the SSE stream into the parser
      resp.data.on("data", (chunk: Buffer) => {
        parser.feed(chunk.toString("utf8"));
      });

      // Wait for the stream to finish
      await new Promise<void>((resolve) => {
        resp.data.on("end", () => {
          console.log("🟢 Stream closed");
          resolve();
        });
      });
    }

    console.log("📦 Total tools fetched:", tools.length);
    return tools;
  } catch (e: unknown) {
    const err: any = e;
    console.error(
      "Failed to fetch MCP tools from",
      mcpUrl,
      err?.response?.data || err?.message || err
    );
    return [];
  }
};

export default { fecthTools };