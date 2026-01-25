import { GetFileBase } from './GetFile';
import { ActionName } from '@/napcat-onebot/action/router';

import { FileActionsExamples } from './examples';

export default class GetImage extends GetFileBase {
  override actionName = ActionName.GetImage;
  override actionSummary = '获取图片';
  override actionDescription = '获取指定图片的信息及路径';
  override actionTags = ['文件接口'];
  override payloadExample = FileActionsExamples.GetImage.payload;
  override returnExample = FileActionsExamples.GetImage.response;
}
