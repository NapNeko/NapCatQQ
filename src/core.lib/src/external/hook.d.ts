declare class HookApi {
    private readonly moeHook;
    constructor();
    getRKey(): string;
    isAvailable(): boolean;
}
export declare const hookApi: HookApi;
export {};
