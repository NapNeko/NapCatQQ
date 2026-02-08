/**
 * HMR 热重载测试插件
 *
 * 测试方法：
 * 1. 将此目录复制到 plugins/ 目录
 * 2. 启动 NapCat 并启用此插件
 * 3. 调用 POST /api/Plugin/HMR { "action": "start" } 启动文件监听
 * 4. 修改下面的 VERSION 常量
 * 5. 观察日志，应该看到 "[HMR] Plugin napcat-hmr-test-plugin reloaded successfully"
 * 6. 调用 GET /api/Plugin/Config?id=napcat-hmr-test-plugin 验证版本号已更新
 *
 * 也可以用隔离模式测试：
 * 1. POST /api/Plugin/Isolate/Load { "id": "napcat-hmr-test-plugin" }
 * 2. POST /api/Plugin/HMR { "action": "start", "useIsolation": true }
 * 3. 修改 VERSION → 观察自动重载
 * 4. GET /api/Plugin/Isolate/Health?id=napcat-hmr-test-plugin
 */

// ====== 修改这行来测试热重载 ======
const VERSION = '1.0.0';
// ==================================

const LOAD_TIME = new Date().toISOString();

let logger: any;

export const plugin_init = async (ctx: any) => {
  logger = ctx.logger;
  logger.info(`▶ HMR 测试插件已初始化 — 版本: ${VERSION}, 加载时间: ${LOAD_TIME}`);
  logger.info(`  插件路径: ${ctx.pluginPath}`);
  logger.info(`  配置路径: ${ctx.configPath}`);
};

export const plugin_onmessage = async (ctx: any, event: any) => {
  // 当收到包含 "hmr-test" 的消息时，回复当前版本
  const text = event?.raw_message || event?.message?.[0]?.data?.text || '';
  if (text.includes('hmr-test')) {
    logger?.info(`收到测试消息，当前版本: ${VERSION}, 加载时间: ${LOAD_TIME}`);
  }
};

export const plugin_cleanup = async (ctx: any) => {
  logger?.info(`◼ HMR 测试插件已卸载 — 版本: ${VERSION}`);
};

// 配置 — 可以通过 WebUI 查看版本号确认热重载是否生效
export const plugin_get_config = async () => ({
  version: VERSION,
  loadTime: LOAD_TIME,
  description: '修改 VERSION 常量后保存文件，如果 HMR 正常，此处应显示新版本号',
});

// 配置 Schema — WebUI 显示
export const plugin_config_ui = [
  {
    key: 'info',
    type: 'html' as const,
    label: '',
    default: `<div style="padding:12px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd">
      <h3 style="margin:0 0 8px">🔥 HMR 热重载测试</h3>
      <p style="margin:0">修改插件目录下的 <code>index.ts</code> 中的 <code>VERSION</code> 常量，</p>
      <p style="margin:0">保存后观察此处版本号是否自动更新。</p>
    </div>`,
  },
  {
    key: 'version',
    type: 'text' as const,
    label: '当前版本',
    default: VERSION,
    description: '此值应在热重载后自动变化',
  },
  {
    key: 'loadTime',
    type: 'text' as const,
    label: '加载时间',
    default: LOAD_TIME,
    description: '每次重载后此时间会更新',
  },
];
