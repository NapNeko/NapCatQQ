import { AtType, SendArkElement, SendFaceElement, SendFileElement, SendMarkdownElement, SendPicElement, SendPttElement, SendReplyElement, SendTextElement, SendVideoElement } from './index';
export declare class SendMsgElementConstructor {
    static text(content: string): SendTextElement;
    static at(atUid: string, atNtUid: string, atType: AtType, atName: string): SendTextElement;
    static reply(msgSeq: string, msgId: string, senderUin: string, senderUinStr: string): SendReplyElement;
    static pic(picPath: string, summary?: string, subType?: 0 | 1): Promise<SendPicElement>;
    static file(filePath: string, fileName?: string): Promise<SendFileElement>;
    static video(filePath: string, fileName?: string, diyThumbPath?: string): Promise<SendVideoElement>;
    static ptt(pttPath: string): Promise<SendPttElement>;
    static face(faceId: number): SendFaceElement;
    static dice(resultId: number | null): SendFaceElement;
    static rps(resultId: number | null): SendFaceElement;
    static ark(data: any): SendArkElement;
    static markdown(content: string): SendMarkdownElement;
}
