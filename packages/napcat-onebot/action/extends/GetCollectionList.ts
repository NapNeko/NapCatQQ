import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  category: Type.String({ description: '分类ID' }),
  count: Type.String({ default: '50', description: '获取数量' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '收藏列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetCollectionList extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetCollectionList;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取收藏列表';
  override actionTags = ['系统扩展'];
  override payloadExample = {
    category: '0',
    count: '50'
  };
  override returnExample = {
    errCode: 0,
    errMsg: "",
    collectionSearchList: {
      collectionItemList: [
        {
          cid: "123456",
          type: 8,
          status: 1,
          author: {
            type: 2,
            numId: "123456",
            strId: "昵称",
            groupId: "123456",
            groupName: "群名",
            uid: "123456"
          },
          bid: 1,
          category: 1,
          createTime: "1769169157000",
          collectTime: "1769413477691",
          modifyTime: "1769413477691",
          sequence: "1769413476735",
          shareUrl: "",
          customGroupId: 0,
          securityBeat: false,
          summary: {
            textSummary: null,
            linkSummary: null,
            gallerySummary: null,
            audioSummary: null,
            videoSummary: null,
            fileSummary: null,
            locationSummary: null,
            richMediaSummary: {
              title: "",
              subTitle: "",
              brief: "text",
              picList: [],
              contentType: 1,
              originalUri: "",
              publisher: "",
              richMediaVersion: 0
            }
          }
        }
      ],
      hasMore: false,
      bottomTimeStamp: "1769413477691"
    }
  };

  async _handle (payload: PayloadType) {
    return await this.core.apis.CollectionApi.getAllCollection(+payload.category, +payload.count);
  }
}
