import { fileTypeFromFile } from 'file-type';
import { PicType } from '../types';
export async function getFileTypeForSendType(picPath: string): Promise<PicType> {
    const fileTypeResult = (await fileTypeFromFile(picPath))?.ext ?? 'jpg';
    const picTypeMap: { [key: string]: PicType } = {
        //'webp': PicType.NEWPIC_WEBP,
        'gif': PicType.NEWPIC_GIF,
        // 'png': PicType.NEWPIC_APNG,
        // 'jpg': PicType.NEWPIC_JPEG,
        // 'jpeg': PicType.NEWPIC_JPEG,
        // 'bmp': PicType.NEWPIC_BMP,
    };
    return picTypeMap[fileTypeResult] ?? PicType.NEWPIC_JPEG;
}