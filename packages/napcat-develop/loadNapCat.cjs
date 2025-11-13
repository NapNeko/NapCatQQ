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
if (versionFolders.length !== 1) {
  console.error('versions 文件夹下必须且只能有一个版本目录');
  process.exit(1);
}

const BASE_DIR = path.join(versionsDir, versionFolders[0], 'resources', 'app');
const TARGET_DIR = path.join(__dirname, 'run');
const QQNT_FILE = path.join(__dirname, 'QQNT.dll');
const NAPCAT_MJS_PATH = path.join(__dirname, '..', 'dist', 'napcat.mjs');

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
  'wrapper.node'
];

async function copyAll () {
  const qqntDllPath = path.join(TARGET_DIR, 'QQNT.dll');
  const configPath = path.join(TARGET_DIR, 'config.json');
  const allItemsExist = await fs.pathExists(qqntDllPath)
    && await fs.pathExists(configPath)
    && (await Promise.all(itemsToCopy.map(item => fs.pathExists(path.join(TARGET_DIR, item))))).every(exists => exists);

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
  process.env.NAPCAT_WORKDIR = path.join(__dirname, 'run');

  console.log('Loading NapCat module...');
  await import(pathToFileURL(NAPCAT_MJS_PATH).href);
}

copyAll().catch(console.error);