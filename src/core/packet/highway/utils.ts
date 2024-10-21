import { NapProtoEncodeStructType } from "@/core/packet/proto/NapProto";
import { IPv4 } from "@/core/packet/proto/oidb/common/Ntv2.RichMediaResp";
import { NTHighwayIPv4 } from "@/core/packet/proto/highway/highway";

export const int32ip2str = (ip: number) => {
    ip = ip & 0xffffffff;
    return [ip & 0xff, (ip & 0xff00) >> 8, (ip & 0xff0000) >> 16, ((ip & 0xff000000) >> 24) & 0xff].join('.');
};

export const oidbIpv4s2HighwayIpv4s = (ipv4s: NapProtoEncodeStructType<typeof IPv4>[]): NapProtoEncodeStructType<typeof NTHighwayIPv4>[] =>{
    return ipv4s.map((ip) => {
        return {
            domain: {
                isEnable: true,
                ip: int32ip2str(ip.outIP!),
            },
            port: ip.outPort!
        } as NapProtoEncodeStructType<typeof NTHighwayIPv4>;
    });
};
