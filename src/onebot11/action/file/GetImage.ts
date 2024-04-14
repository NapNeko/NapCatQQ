import { GetFileBase } from './GetFile';
import { ActionName } from '../types';


export default class GetImage extends GetFileBase {
  actionName = ActionName.GetImage;
}