let fs = require('fs');
let path = require('path');
let JavaScriptObfuscator = require('javascript-obfuscator');

const dirPath = path.join(__dirname, '../dist/core');
const outputPath = dirPath;

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, {recursive: true});
}

function obfuscateDir(currentPath, outputDir) {
  fs.readdir(currentPath, {withFileTypes: true}, (err, entries) => {
    if (err) throw err;

    entries.forEach(entry => {
      const localBasePath = path.join(currentPath, entry.name);
      const outputLocalBasePath = path.join(outputDir, entry.name);

      if (entry.isDirectory()) {
        // 如果是目录，递归调用
        if (!fs.existsSync(outputLocalBasePath)) {
          fs.mkdirSync(outputLocalBasePath, {recursive: true});
        }
        obfuscateDir(localBasePath, outputLocalBasePath);
      } else if (entry.isFile() && path.extname(entry.name) === '.js') {
        // 如果是文件且为 .js，进行混淆
        fs.readFile(localBasePath, (err, content)=>{
          // console.log('read file', localBasePath);
          const obfuscated = JavaScriptObfuscator.obfuscate(content.toString(), {
            compact: true,
            controlFlowFlattening: true
          });
          // console.log('obfuscate file', localBasePath);
          fs.writeFile(outputLocalBasePath, obfuscated.getObfuscatedCode(), ()=>{
            // console.log(`[NapCat] [Obfuscator] ${localBasePath} => ${outputLocalBasePath}`);
          });
        });
      }
    });
  });
}

// 开始混淆
obfuscateDir(dirPath, outputPath);
