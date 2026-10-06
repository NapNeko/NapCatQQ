// const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

async function initializeNapCat (session, loginService, registerCallback) {
  // const logFile = path.join(currentPath, 'napcat.log');

  console.log('[NapCat] [Info] 开始初始化NapCat');

  // fs.writeFileSync(logFile, '', { flag: 'w' });

  // fs.writeFileSync(logFile, '[NapCat] [Info] NapCat 初始化成功\n', { flag: 'a' });

  try {
    const currentPath = path.dirname(__filename);
    const { NCoreInitFramework } = await import(pathToFileURL(path.join(currentPath, './napcat.mjs')).href);
    await NCoreInitFramework(session, loginService, (callback) => { registerCallback(callback); });
  } catch (error) {
    console.log('[NapCat] [Error] 初始化NapCat', error);
    // fs.writeFileSync(logFile, `[NapCat] [Error] 初始化NapCat失败: ${error.message}\n`, { flag: 'a' });
  }
}

module.exports = {
  initializeNapCat,
};
