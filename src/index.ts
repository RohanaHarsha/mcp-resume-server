// src/index.ts  (small excerpt)
import 'dotenv/config';
import { startHttpServer } from './httpServer.js';

const modeArgIdx = process.argv.indexOf('--mode');
let mode = process.env.MODE || 'http';
if (modeArgIdx >= 0 && process.argv[modeArgIdx + 1]) {
  mode = process.argv[modeArgIdx + 1];
}

const resumePath = process.env.RESUME_PATH || './resume/resume.md';

if (mode === 'mcp-sdk') {
  // dynamic import so ts->js import paths are correct at runtime
  import('./mcpSdkServer.js').then(mod => {
    mod.startMcpSdkServer(resumePath).catch(err => {
      console.error("MCP SDK server crashed:", err);
      process.exit(1);
    });
  });
} else {
  const port = Number(process.env.PORT || 8787);
  startHttpServer(port, resumePath);
}
