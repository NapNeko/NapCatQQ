export interface NodeIKernelAlbumService {

    setAlbumServiceInfo(...args: unknown[]): unknown;// needs 3 arguments

    getMainPage(...args: unknown[]): unknown;// needs 2 arguments

    getAlbumList(params: {
        qun_id: string,
        attach_info: string,
        seq: number,
        request_time_line: {
            request_invoke_time: string
        }
    }): Promise<{
        response: {
            seq: number,
            result: number,
            errMs: string,//没错就是errMs不是errMsg
            trace_id: string,
            is_from_cache: boolean,
            request_time_line: unknown,
            album_list: Array<unknown>,
            attach_info: string,
            has_more: boolean,
            right: unknown,
            banner: unknown
        }
    }>
    getAlbumInfo(...args: unknown[]): unknown;// needs 1 arguments

    deleteAlbum(...args: unknown[]): unknown;// needs 3 arguments

    addAlbum(...args: unknown[]): unknown;// needs 2 arguments

    deleteMedias(...args: unknown[]): unknown;// needs 4 arguments

    modifyAlbum(...args: unknown[]): unknown;// needs 3 arguments

    getMediaList(...args: unknown[]): unknown;// needs 1 arguments

    quoteToQzone(...args: unknown[]): unknown;// needs 1 arguments

    quoteToQunAlbum(...args: unknown[]): unknown;// needs 1 arguments

    queryQuoteToQunAlbumStatus(...args: unknown[]): unknown;// needs 1 arguments

    getQunFeeds(...args: unknown[]): unknown;//needs 1 arguments

    getQunFeedDetail(...args: unknown[]): unknown;// needs 1 arguments

    getQunNoticeList(...args: unknown[]): unknown;// needs 4 arguments

    getQunComment(...args: unknown[]): unknown;// needs 1 arguments

    getQunLikes(...args: unknown[]): unknown;// needs 4 arguments

    deleteQunFeed(...args: unknown[]): unknown;// needs 1 arguments

    doQunComment(...args: unknown[]): unknown;// needs 6 arguments

    doQunReply(...args: unknown[]): unknown;// needs 7 arguments

    doQunLike(...args: unknown[]): unknown;// needs 5 arguments

    getRedPoints(...args: unknown[]): unknown;// needs 3 arguments

}
