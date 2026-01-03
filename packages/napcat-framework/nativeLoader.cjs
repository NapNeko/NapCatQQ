// const fs = require('fs');
const path = require('path');

async function initializeNapCat (session, loginService, registerCallback) {
  console.log('[NapCat] [Info] 开始初始化NapCat');

  try {
    const currentPath = path.dirname(__filename);
    const { NCoreInitFramework } = await import('file://' + path.join(currentPath, './napcat.mjs'));
    await NCoreInitFramework(session, loginService, (callback) => { registerCallback(callback); });
  } catch (error) {
    console.log('[NapCat] [Error] 初始化NapCat', error);
    // fs.writeFileSync(logFile, `[NapCat] [Error] 初始化NapCat失败: ${error.message}\n`, { flag: 'a' });
  }
}

module.exports = {
  initializeNapCat,
};
