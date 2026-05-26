const fs = require('fs');
const html = fs.readFileSync('C:/Users/pandu/.gemini/antigravity-ide/brain/27e09a64-c3ae-46a4-865a-4b3263ce8d46/.system_generated/steps/1231/content.md', 'utf8');
const alts = [...html.matchAll(/alt="([^"]+)"/g)].map(m => m[1]);
console.log(alts.filter(a => !['Close', 'Indigo', 'Program', 'Arrow'].includes(a)));
