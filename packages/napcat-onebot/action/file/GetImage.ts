import { GetFileBase } from './GetFile';
import { ActionName } from '@/napcat-onebot/action/router';

import { ActionExamples } from '../examples';

export default class GetImage extends GetFileBase {
  override actionName = ActionName.GetImage;
  override actionDescription = '获取图片';
  override payloadExample = ActionExamples.GetImage.payload;
  override returnExample = ActionExamples.GetImage.return;
}
