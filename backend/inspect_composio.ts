
import { Composio } from "@composio/core";

const c = new Composio({ apiKey: 'TEST' });
console.log('--- Instance Keys ---');
console.log(Object.keys(c));
console.log('--- Prototype Keys ---');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(c)));

if (c.tools) {
    console.log('--- c.tools Keys ---');
    console.log(Object.getOwnPropertyKeys(c.tools));
    console.log('--- c.tools Proto ---');
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(c.tools)));
} else {
    console.log('c.tools is undefined');
}
