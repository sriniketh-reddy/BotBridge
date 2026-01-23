
import { Composio } from "@composio/core";

const c = new Composio({ apiKey: 'TEST' });
const out = [];

if (c.tools) {
    out.push('c.tools keys: ' + Object.keys(c.tools).join(','));
    // Check proto
    out.push('c.tools proto: ' + Object.getOwnPropertyNames(Object.getPrototypeOf(c.tools)).join(','));
} else {
    out.push('c.tools missing');
}

console.log(out.join(' || '));
