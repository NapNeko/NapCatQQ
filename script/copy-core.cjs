let fs = require('fs');
let path = require('path');

const coreDistDir = path.join(path.resolve(__dirname, '../'), 'src/core/dist/core/src');
const coreLibDir = path.join(path.resolve(__dirname, '../'), 'src/core.lib/src');

function copyDir(currentPath, outputDir) {
  fs.readdir(currentPath, { withFileTypes: true }, (err, entries) => {
    if (err?.errno === -4058) return;

    entries.forEach(entry => {
      const localBasePath = path.join(currentPath, entry.name);
      const outputLocalBasePath = path.join(outputDir, entry.name);

      if (entry.isDirectory()) {
        // 如果是目录，递归调用
        if (!fs.existsSync(outputLocalBasePath)) {
          fs.mkdirSync(outputLocalBasePath, { recursive: true });
        }
        copyDir(localBasePath, outputLocalBasePath);
      }
      else{
        // 如果是文件，直接复制
        fs.copyFile(localBasePath, outputLocalBasePath, (err) => {
          if (err) throw err;
        });
      }
    });
  });
}

copyDir(coreDistDir, coreLibDir);
