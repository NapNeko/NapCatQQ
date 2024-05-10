import * as frida from 'frida';
import { promises as fs } from 'fs';
import path from 'node:path';

async function loadFridaScript(scriptPath: string): Promise<void> {
  try {
    // Attach to the process
    const currentPid = process.pid;
    console.log('Attaching to process:', currentPid);
    const targetProcess = await frida.attach(currentPid);

    // Read the script file
    const scriptCode = await fs.readFile(scriptPath, { encoding: 'utf8' });

    // Create the script in the target process
    const script = await targetProcess.createScript(scriptCode);

    // Connect to script messages
    script.message.connect((message, data) => {
      if (message.type === 'send') {
        console.log('[Script]:', message.payload);
      } else if (message.type === 'error') {
        console.error('[Script Error]:', message.stack);
      }
    });

    // Load the script into the target process
    await script.load();

    console.log('Script loaded successfully and is now running.');
  } catch (error) {
    console.error('Failed to load script:', error);
  }
}

export function hookInit() {
// Assuming the process name and script file path are correct
  loadFridaScript(path.join(path.resolve(__dirname), 'frida_script.js')).catch(console.error);
}
