import "reflect-metadata";
import { Container, injectable } from "inversify";
import { NapCatCore } from "../..";

export const container = new Container();

export const ReceiverServiceRegistry = new Map<string, new (...args: any[]) => ServiceBase>();

export abstract class ServiceBase {
    get core(): NapCatCore {
        return container.get(NapCatCore);
    }

    abstract handler(seq: number, hex_data: string): Promise<void> | void;
}

export function ReceiveService(serviceName: string) {
    return function <T extends new (...args: any[]) => ServiceBase>(constructor: T) {
        injectable()(constructor);
        ReceiverServiceRegistry.set(serviceName, constructor);
        return constructor;
    };
}

