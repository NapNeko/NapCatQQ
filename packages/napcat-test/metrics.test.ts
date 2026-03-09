import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Registry } from 'prom-client';

const mockWebUiDataRuntime = {
  getQQLoginStatus: vi.fn().mockReturnValue(false),
  getOneBotContext: vi.fn().mockReturnValue(null),
  GetNapCatVersion: vi.fn().mockReturnValue('4.0.0'),
  getQQVersion: vi.fn().mockReturnValue('9.9.0'),
  getQQLoginUin: vi.fn().mockReturnValue('12345678'),
};

const mockResourceManager = {
  getAllResourceStats: vi.fn().mockReturnValue(new Map()),
};

vi.mock('@/napcat-webui-backend/src/helper/Data', () => ({
  WebUiDataRuntime: mockWebUiDataRuntime,
}));

vi.mock('napcat-common/src/health', () => ({
  resourceManager: mockResourceManager,
}));

let getMetrics: () => Promise<string>;
let register: Registry;

beforeEach(async () => {
  vi.clearAllMocks();
  mockWebUiDataRuntime.getQQLoginStatus.mockReturnValue(false);
  mockWebUiDataRuntime.getOneBotContext.mockReturnValue(null);
  mockWebUiDataRuntime.GetNapCatVersion.mockReturnValue('4.0.0');
  mockWebUiDataRuntime.getQQVersion.mockReturnValue('9.9.0');
  mockWebUiDataRuntime.getQQLoginUin.mockReturnValue('12345678');
  mockResourceManager.getAllResourceStats.mockReturnValue(new Map());

  const mod = await import('@/napcat-webui-backend/src/api/Metrics');
  getMetrics = mod.getMetrics;
  register = mod.register;
  register.resetMetrics();
});

describe('Prometheus Metrics — getMetrics()', () => {
  it('returns valid Prometheus text format with HELP and TYPE lines', async () => {
    const output = await getMetrics();
    expect(output).toContain('# HELP');
    expect(output).toContain('# TYPE');
  });

  it('includes default Node.js process metrics', async () => {
    const output = await getMetrics();
    expect(output).toContain('napcat_process_cpu');
  });

  it('reports napcat_qq_login_status 0 when not logged in', async () => {
    mockWebUiDataRuntime.getQQLoginStatus.mockReturnValue(false);
    const output = await getMetrics();
    expect(output).toMatch(/napcat_qq_login_status 0/);
  });

  it('reports napcat_qq_login_status 1 when logged in', async () => {
    mockWebUiDataRuntime.getQQLoginStatus.mockReturnValue(true);
    const output = await getMetrics();
    expect(output).toMatch(/napcat_qq_login_status 1/);
  });

  it('includes napcat_uptime_seconds as a positive number', async () => {
    const output = await getMetrics();
    const match = output.match(/napcat_uptime_seconds (\d+(?:\.\d+)?)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThan(0);
  });
});

describe('Prometheus Metrics — with OneBot context', () => {
  function createMockOb11 (online: boolean, adapters: [string, boolean, boolean][]) {
    const adapterMap = new Map<string, { isActive: boolean; isEnable: boolean }>();
    for (const [name, active, enabled] of adapters) {
      adapterMap.set(name, { isActive: active, isEnable: enabled });
    }
    return {
      core: { selfInfo: { online } },
      networkManager: { adapters: adapterMap },
    };
  }

  it('reports napcat_qq_online 1 when bot is online', async () => {
    mockWebUiDataRuntime.getOneBotContext.mockReturnValue(
      createMockOb11(true, []),
    );
    const output = await getMetrics();
    expect(output).toMatch(/napcat_qq_online 1/);
  });

  it('reports napcat_qq_online 0 when bot is offline', async () => {
    mockWebUiDataRuntime.getOneBotContext.mockReturnValue(
      createMockOb11(false, []),
    );
    const output = await getMetrics();
    expect(output).toMatch(/napcat_qq_online 0/);
  });

  it('includes napcat_info gauge with version labels', async () => {
    mockWebUiDataRuntime.getOneBotContext.mockReturnValue(
      createMockOb11(true, []),
    );
    const output = await getMetrics();
    expect(output).toContain('napcat_info');
    expect(output).toContain('version="4.0.0"');
    expect(output).toContain('qq_version="9.9.0"');
    expect(output).toContain('uin="12345678"');
  });

  it('reports per-adapter active and enabled status', async () => {
    mockWebUiDataRuntime.getOneBotContext.mockReturnValue(
      createMockOb11(true, [
        ['ws_server', true, true],
        ['http_client', false, true],
        ['ws_client', false, false],
      ]),
    );
    const output = await getMetrics();

    expect(output).toMatch(/napcat_onebot_adapter_active\{name="ws_server"\} 1/);
    expect(output).toMatch(/napcat_onebot_adapter_active\{name="http_client"\} 0/);
    expect(output).toMatch(/napcat_onebot_adapter_active\{name="ws_client"\} 0/);

    expect(output).toMatch(/napcat_onebot_adapter_enabled\{name="ws_server"\} 1/);
    expect(output).toMatch(/napcat_onebot_adapter_enabled\{name="http_client"\} 1/);
    expect(output).toMatch(/napcat_onebot_adapter_enabled\{name="ws_client"\} 0/);
  });
});

describe('Prometheus Metrics — graceful degradation', () => {
  it('succeeds when OneBot context is null', async () => {
    mockWebUiDataRuntime.getOneBotContext.mockReturnValue(null);
    const output = await getMetrics();
    expect(output).toContain('napcat_qq_login_status');
    expect(output).toContain('napcat_uptime_seconds');
    // napcat_info should have no value line (only HELP/TYPE headers)
    expect(output).not.toMatch(/napcat_info\{.*\} \d/);
    // No adapter value lines should appear
    expect(output).not.toMatch(/napcat_onebot_adapter_active\{.*\} \d/);
    expect(output).not.toMatch(/napcat_onebot_adapter_enabled\{.*\} \d/);
  });

  it('succeeds when OneBot context has no networkManager.adapters', async () => {
    mockWebUiDataRuntime.getOneBotContext.mockReturnValue({
      core: { selfInfo: { online: true } },
      networkManager: {},
    });
    const output = await getMetrics();
    expect(output).toContain('napcat_qq_online 1');
    // No adapter value lines should appear
    expect(output).not.toMatch(/napcat_onebot_adapter_active\{.*\} \d/);
    expect(output).not.toMatch(/napcat_onebot_adapter_enabled\{.*\} \d/);
  });
});

describe('Prometheus Metrics — resource stats', () => {
  it('reports resource success and failure counts', async () => {
    const stats = new Map([
      ['image_upload', { successCount: 42, failureCount: 3, isEnabled: true, isPermanentlyDisabled: false }],
      ['file_download', { successCount: 10, failureCount: 0, isEnabled: true, isPermanentlyDisabled: false }],
    ]);
    mockResourceManager.getAllResourceStats.mockReturnValue(stats);

    const output = await getMetrics();
    expect(output).toMatch(/napcat_resource_success_total\{type="image_upload"\} 42/);
    expect(output).toMatch(/napcat_resource_failure_total\{type="image_upload"\} 3/);
    expect(output).toMatch(/napcat_resource_success_total\{type="file_download"\} 10/);
    expect(output).toMatch(/napcat_resource_failure_total\{type="file_download"\} 0/);
  });

  it('omits resource metrics when no resources are registered', async () => {
    mockResourceManager.getAllResourceStats.mockReturnValue(new Map());
    const output = await getMetrics();
    expect(output).not.toMatch(/napcat_resource_success_total\{type=/);
  });
});
