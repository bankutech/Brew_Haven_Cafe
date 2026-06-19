const fs = require('fs'); 
const lines = fs.readFileSync('C:/Users/Administrator/.gemini/antigravity/brain/5295e099-c342-40a9-ba43-084cdd6715ce/.system_generated/logs/transcript.jsonl', 'utf8').split('\n'); 
for(const line of lines) {
  if (line.includes('"source":"MODEL"') && line.includes("Here's a summary of what was found across 20 bugs in 4 severity tiers")) {
    try {
      const d = JSON.parse(line);
      console.log(d.content.substring(0, 3000));
    } catch(e) {}
  }
}
