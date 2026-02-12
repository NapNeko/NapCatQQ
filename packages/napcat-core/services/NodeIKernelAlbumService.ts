import { AlbumCommentReplyContent, AlbumFeedLikePublish, AlbumListRequest, AlbumMediaFeed } from '../data/album';

export interface NodeIKernelAlbumService {

  setAlbumServiceInfo (arg1: string, arg2: string, arg3: string): unknown;// needs 3 arguments

  getMainPage (arg1: unknown, arg2: unknown): unknown;// needs 2 arguments

  getAlbumList (params: {
    qun_id: string,
    attach_info: string,
    seq: number,
    request_time_line: {
      request_invoke_time: string;
    };
  }): Promise<{
    response: {
      seq: number,
      result: number,
      errMs: string, // 没错就是errMs不是errMsg
      trace_id: string,
      is_from_cache: boolean,
      request_time_line: unknown,
      album_list: Array<{ name: string, album_id: string; }>,
      attach_info: string,
      has_more: boolean,
      right: unknown,
      banner: unknown;
    };
  }>;
  getAlbumInfo (arg: unknown): unknown;// needs 1 arguments

  deleteAlbum (arg1: number, arg2: string, arg3: string): unknown;// needs 3 arguments

  addAlbum (arg1: unknown, arg2: unknown): unknown;// needs 2 arguments

  deleteMedias (seq: number, group_code: string, album_id: string, media_ids: string[], ban_ids: unknown[]): Promise<unknown>;// needs 4 arguments

  modifyAlbum (arg1: number, arg2: unknown, arg3: Array<unknown>[]): unknown;// needs 3 arguments

  getMediaList (param: AlbumListRequest): Promise<{
    response: {
      seq: number,
      result: number,
      errMs: string, // 没错就是errMs不是errMsg
      trace_id: string,
      request_time_line: unknown,
    };
  }>;// needs 1 arguments

  quoteToQzone (arg: unknown): unknown;// needs 1 arguments

  quoteToQunAlbum (arg: unknown): unknown;// needs 1 arguments

  queryQuoteToQunAlbumStatus (arg: unknown): unknown;// needs 1 arguments

  getQunFeeds (arg: unknown): unknown;// needs 1 arguments

  getQunFeedDetail (arg: unknown): unknown;// needs 1 arguments

  getQunNoticeList (arg1: number, arg2: unknown, arg3: string, arg4: string): unknown;// needs 4 arguments

  getQunComment (arg: unknown): unknown;// needs 1 arguments

  getQunLikes (arg1: number, arg2: unknown, arg3: string, arg4: string): unknown;// needs 4 arguments

  deleteQunFeed (arg: unknown): unknown;// needs 1 arguments
  // seq random
  // stCommonExt {"map_info":[],"map_bytes_info":[],"map_user_account":[]}
  // qunId string
  doQunComment (seq: number, ext: {
    map_info: unknown[],
    map_bytes_info: unknown[],
    map_user_account: unknown[];
  },
    qunId: string,
    commentType: number,
    feed: AlbumMediaFeed,
    content: AlbumCommentReplyContent,
  ): Promise<unknown>;// needs 6 arguments

  doQunReply (arg1: number, arg2: unknown, arg3: string, arg4: number, arg5: unknown, arg6: unknown, arg7: unknown): unknown;// needs 7 arguments

  doQunLike (
    seq: number,
    ext: {
      map_info: unknown[],
      map_bytes_info: unknown[],
      map_user_account: unknown[];
    },
    param: {
      // {"id":"421_1_0_1012959257|V61Yiali4PELg90bThrH4Bo2iI1M5Kab|V5bCgAxMDEyOTU5MjU3e*KqaLVYdic!^||^421_1_0_1012959257|V61Yiali4PELg90bThrH4Bo2iI1M5Kab|17560336594^||^1","status":1}
      id: string,
      status: number;
    },
    like: AlbumFeedLikePublish
  ): Promise<unknown>;// needs 5 arguments

  getRedPoints (arg1: string, arg2: number, arg3: string): unknown;// needs 3 arguments

}
