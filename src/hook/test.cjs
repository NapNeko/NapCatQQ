const frida = require('frida');
const fs = require('fs');
const path = require('path');

async function main() {
  // 获取当前 Node.js 进程的 ID
  const pid = process.pid;
  const session = await frida.attach(pid);  // 附加到当前进程

  const scriptCode = fs.readFileSync(path.join(path.resolve(__dirname), 'frida_script.js'), 'utf-8');
  const script = await session.createScript(scriptCode);

  script.message.connect(message => {
    console.log('Message from Frida:', message);
  });

  await script.load();
  console.log('Frida script has been loaded successfully.');
}

main().catch(err => {
  console.error(err);
});
