import { NapProtoEncodeStructType } from '@napneko/nap-proto-core';
import * as proto from '@/core/packet/transformer/proto';


export const int32ip2str = (ip: number) => {
    ip = ip & 0xffffffff;
    return [ip & 0xff, (ip & 0xff00) >> 8, (ip & 0xff0000) >> 16, ((ip & 0xff000000) >> 24) & 0xff].join('.');
};

export const oidbIpv4s2HighwayIpv4s = (ipv4s: NapProtoEncodeStructType<typeof proto.IPv4>[]): NapProtoEncodeStructType<typeof proto.NTHighwayIPv4>[] => {
    return ipv4s.map((ip) => {
        return {
            domain: {
                isEnable: true,
                ip: int32ip2str(ip.outIP ?? 0),
            },
            port: ip.outPort!
        } as NapProtoEncodeStructType<typeof proto.NTHighwayIPv4>;
    });
};
