import { ActionPing, ActionPong } from '@/laana-v0.1.2/types/action/wrapper';

type ExtractFromPongOrVoid<key> = Extract<ActionPong['pong'], { oneofKind: key; }> extends never ?
    void :
    // eslint-disable-next-line
    // @ts-ignore
    Extract<ActionPong['pong'], { oneofKind: key; }>[key];

type LaanaActionMapping = {
    [key in Exclude<ActionPing['ping']['oneofKind'], undefined>]:
    (
        params:
            // eslint-disable-next-line
            // @ts-ignore
            Extract<ActionPing['ping'], { oneofKind: key; }>[key]
    ) => PromiseLike<ExtractFromPongOrVoid<key>>;
};

export type LaanaActionHandler = Partial<LaanaActionMapping>;
