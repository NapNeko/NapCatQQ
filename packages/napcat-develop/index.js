const path = require('path');
const { pathToFileURL } = require('url');

// 公共目录变量
const BASE_DIR = __dirname;
const WRAPPER_NODE_PATH = path.join(BASE_DIR, 'wrapper.node');
const PACKAGE_JSON_PATH = path.join(BASE_DIR, 'package.json');
const CONFIG_JSON_PATH = path.join(BASE_DIR, 'config.json');
const NAPCAT_MJS_PATH = path.join(BASE_DIR, 'napcat', 'napcat.mjs');
process.env.NAPCAT_WRAPPER_PATH = WRAPPER_NODE_PATH;
process.env.NAPCAT_QQ_PACKAGE_INFO_PATH = PACKAGE_JSON_PATH;
process.env.NAPCAT_QQ_VERSION_CONFIG_PATH = CONFIG_JSON_PATH;
process.env.NAPCAT_DISABLE_PIPE = '1';
import(pathToFileURL(NAPCAT_MJS_PATH).href);
