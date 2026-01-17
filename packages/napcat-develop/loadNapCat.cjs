const fs = require('fs-extra');
const path = require('path');
const { pathToFileURL } = require('url');

const mainPath = process.argv[2];
if (!mainPath) {
  console.error('Please provide the base directory as the first argument.');
  process.exit(1);
}

// 动态获取 versions 下唯一的版本文件夹,并拼接 resources/app 路径
const versionsDir = path.join(mainPath, 'versions');
console.log(`Looking for version folders in: ${versionsDir}`);
const versionFolders = fs.readdirSync(versionsDir).filter(f => fs.statSync(path.join(versionsDir, f)).isDirectory());
let selectedFolder;
if (versionFolders.length === 0) {
  console.error('versions 文件夹下没有找到版本目录');
  process.exit(1);
} else if (versionFolders.length === 1) {
  selectedFolder = versionFolders[0];
} else {
  // 获取时间最新的文件夹
  const stats = versionFolders.map(folder => {
    const folderPath = path.join(versionsDir, folder);
    return { folder, mtime: fs.statSync(folderPath).mtime };
  });
  stats.sort((a, b) => b.mtime - a.mtime);
  selectedFolder = stats[0].folder;
  console.log(`多个版本文件夹存在，选择最新的: ${selectedFolder}`);
}

const BASE_DIR = path.join(versionsDir, selectedFolder, 'resources', 'app');
console.log(`BASE_DIR: ${BASE_DIR}`);
const TARGET_DIR = path.join(__dirname, 'dist');
const QQNT_FILE = path.join(__dirname, 'QQNT.dll');
const NAPCAT_MJS_PATH = path.join(__dirname, '..', 'napcat-shell', 'dist', 'napcat.mjs');

const itemsToCopy = [
  'avif_convert.dll',
  'broadcast_ipc.dll',
  'libglib-2.0-0.dll',
  'libgobject-2.0-0.dll',
  'libvips-42.dll',
  'ncnn.dll',
  'opencv.dll',
  'package.json',
  'QBar.dll',
  'wrapper.node',
];

async function copyAll () {
  const qqntDllPath = path.join(TARGET_DIR, 'QQNT.dll');
  const configPath = path.join(TARGET_DIR, 'config.json');
  const allItemsExist = await fs.pathExists(qqntDllPath) &&
    await fs.pathExists(configPath) &&
    (await Promise.all(itemsToCopy.map(item => fs.pathExists(path.join(TARGET_DIR, item))))).every(exists => exists);

  if (!allItemsExist) {
    console.log('Copying required files...');
    await fs.ensureDir(TARGET_DIR);
    await fs.copy(QQNT_FILE, qqntDllPath, { overwrite: true });
    await fs.copy(path.join(versionsDir, 'config.json'), configPath, { overwrite: true });
    await Promise.all(itemsToCopy.map(async (item) => {
      await fs.copy(path.join(BASE_DIR, item), path.join(TARGET_DIR, item), { overwrite: true });
      console.log(`Copied ${item}`);
    }));
    console.log('All files copied successfully.');
  } else {
    console.log('Files already exist, skipping copy.');
  }

  process.env.NAPCAT_WRAPPER_PATH = path.join(TARGET_DIR, 'wrapper.node');
  process.env.NAPCAT_QQ_PACKAGE_INFO_PATH = path.join(TARGET_DIR, 'package.json');
  process.env.NAPCAT_QQ_VERSION_CONFIG_PATH = path.join(TARGET_DIR, 'config.json');
  process.env.NAPCAT_DISABLE_PIPE = '1';
  // 禁用重启和多进程功能
  process.env.NAPCAT_DISABLE_MULTI_PROCESS = '1';
  process.env.NAPCAT_WORKDIR = TARGET_DIR;
  // 开发环境使用固定密钥
  process.env.NAPCAT_WEBUI_JWT_SECRET_KEY = 'napcat_dev_secret_key';
  process.env.NAPCAT_WEBUI_SECRET_KEY = 'napcat';
  console.log('Loading NapCat module...');
  await import(pathToFileURL(NAPCAT_MJS_PATH).href);
}

copyAll().catch(console.error);
