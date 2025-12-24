/**
 * Fontmin Script - 动态裁剪字体
 * 扫描 src 目录中所有中文字符，生成字体子集
 */
const Fontmin = require('fontmin');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 配置
const SOURCE_FONT = path.resolve(__dirname, '../src/assets/fonts/AaCute-full.ttf');
const SOURCE_TTF_ORIGINAL = path.resolve(__dirname, '../src/assets/fonts/AaCute.ttf');
const OUTPUT_DIR = path.resolve(__dirname, '../public/fonts');
const OUTPUT_NAME = 'AaCute.woff';
const SRC_DIR = path.resolve(__dirname, '../src');

// 基础字符集（常用汉字 + 标点 + 数字 + 字母）
const BASE_CHARS = `
  0123456789
  abcdefghijklmnopqrstuvwxyz
  ABCDEFGHIJKLMNOPQRSTUVWXYZ
  ，。！？、；：""''（）【】《》…—·
  ,.:;!?'"()[]<>-_+=*/\\|@#$%^&~\`
  基础信息系统版本网络配置服务器客户端终端日志调试关于设置主题
  登录退出确定取消保存删除编辑新建刷新加载更新下载上传
  成功失败错误警告提示信息状态在线离线连接断开
  用户名密码账号验证码记住自动
  文件管理打开关闭复制粘贴剪切重命名移动
  发送消息输入内容搜索查找筛选排序
  帮助文档教程反馈问题建议
  开启关闭启用禁用显示隐藏展开收起
  返回前进上一步下一步完成跳过
  今天昨天明天时间日期年月日时分秒
  总量使用占用剩余内存内核主频型号
  有新版本可用当前最新立即稍后
`;

/**
 * 从源码文件中提取所有中文字符
 */
function extractCharsFromSource () {
  const chars = new Set(BASE_CHARS.replace(/\s/g, ''));

  // 匹配所有 .tsx, .ts, .jsx, .js, .css 文件
  const files = glob.sync(`${SRC_DIR}/**/*.{tsx,ts,jsx,js,css}`, {
    ignore: ['**/node_modules/**']
  });

  // 中文字符正则
  const chineseRegex = /[\u4e00-\u9fa5]/g;

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const matches = content.match(chineseRegex);
      if (matches) {
        matches.forEach(char => chars.add(char));
      }
    } catch (e) {
      console.warn(`Warning: Could not read file ${file}`);
    }
  });

  return Array.from(chars).join('');
}

/**
 * 运行 fontmin
 */
async function run () {
  console.log('🔍 Scanning source files for Chinese characters...');
  const text = extractCharsFromSource();
  console.log(`📝 Found ${text.length} unique characters`);

  // 检查源字体是否存在
  let sourceFont = SOURCE_FONT;
  if (!fs.existsSync(SOURCE_FONT)) {
    // 尝试查找原始 TTF 并复制（不重命名，保留原始）
    if (fs.existsSync(SOURCE_TTF_ORIGINAL)) {
      console.log('📦 Copying original font to AaCute-full.ttf...');
      fs.copyFileSync(SOURCE_TTF_ORIGINAL, SOURCE_FONT);
    } else {
      console.error(`❌ Source font not found: ${SOURCE_FONT}`);
      console.log('💡 Please ensure AaCute.ttf exists in src/assets/fonts/');
      process.exit(1);
    }
  }

  console.log('✂️  Subsetting font...');

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const fontmin = new Fontmin()
    .src(sourceFont)
    .use(Fontmin.glyph({ text }))
    .use(Fontmin.ttf2woff())
    .dest(OUTPUT_DIR);

  return new Promise((resolve, reject) => {
    fontmin.run((err, files) => {
      if (err) {
        console.error('❌ Fontmin error:', err);
        reject(err);
      } else {
        // 重命名输出文件
        const generatedWoff = path.join(OUTPUT_DIR, 'AaCute-full.woff');
        const targetFile = path.join(OUTPUT_DIR, OUTPUT_NAME);

        if (fs.existsSync(generatedWoff)) {
          // 如果目标文件存在，先删除
          if (fs.existsSync(targetFile)) {
            fs.unlinkSync(targetFile);
          }
          fs.renameSync(generatedWoff, targetFile);
        }

        // 清理生成的 TTF 文件
        const generatedTtf = path.join(OUTPUT_DIR, 'AaCute-full.ttf');
        if (fs.existsSync(generatedTtf)) {
          fs.unlinkSync(generatedTtf);
        }

        if (fs.existsSync(targetFile)) {
          const stats = fs.statSync(targetFile);
          const sizeKB = (stats.size / 1024).toFixed(2);
          console.log(`✅ Font subset created: ${targetFile} (${sizeKB} KB)`);
        }
        resolve();
      }
    });
  });
}

run().catch(console.error);
