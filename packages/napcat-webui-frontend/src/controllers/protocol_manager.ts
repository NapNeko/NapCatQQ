import { serverRequest } from '@/utils/request';

const ProtocolManager = {
  async getSupportedProtocols (): Promise<ProtocolInfo[]> {
    const res = await serverRequest.get<ServerResponse<ProtocolInfo[]>>(
      '/ProtocolConfig/protocols'
    );
    if (res.data.code !== 0) {
      throw new Error(res.data.message);
    }
    return res.data.data;
  },

  async getProtocolStatus (): Promise<Record<string, boolean>> {
    const res = await serverRequest.get<ServerResponse<Record<string, boolean>>>(
      '/ProtocolConfig/status'
    );
    if (res.data.code !== 0) {
      throw new Error(res.data.message);
    }
    return res.data.data;
  },

  async getSatoriConfig (): Promise<SatoriConfig> {
    const res = await serverRequest.get<ServerResponse<SatoriConfig>>(
      '/ProtocolConfig/satori'
    );
    if (res.data.code !== 0) {
      throw new Error(res.data.message);
    }
    return res.data.data;
  },

  async setSatoriConfig (config: SatoriConfig): Promise<void> {
    const res = await serverRequest.post<ServerResponse<null>>(
      '/ProtocolConfig/satori',
      { config: JSON.stringify(config) }
    );
    if (res.data.code !== 0) {
      throw new Error(res.data.message);
    }
  },
};

export default ProtocolManager;
