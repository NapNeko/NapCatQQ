import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type, Optional } from '@sinclair/typebox';
import path from 'node:path';
import fs from 'node:fs';

const richMediaList = [
  '.mp4', '.mov', '.avi', '.wmv', '.mpeg', '.mpg', '.flv', '.mkv',
  '.png', '.gif', '.jpg', '.jpeg', '.webp', '.bmp',
];

const aiList = ['.ai', '.eps'];
const apkList = ['.apk'];
const audioList = ['.mp3', '.wav', '.wma', '.aac', '.flac', '.ogg', '.m4a', '.mid', '.amr', '.m4r'];
const bakList = ['.bak', '.tmp', '.old', '.swp'];
const codeList = ['.js', '.ts', '.jsx', '.tsx', '.json', '.c', '.cpp', '.h', '.hpp', '.java', '.py', '.go', '.rs', '.php', '.html', '.css', '.sh', '.bat', '.cmd', '.xml', '.yaml', '.yml', '.sql', '.lua', '.rb'];
const dmgList = ['.dmg'];
const docList = ['.doc', '.docx', '.wps', '.dot', '.dotx', '.odt', '.rtf'];
const exeList = ['.exe', '.msi', '.com', '.scr', '.bin'];
const fontList = ['.ttf', '.otf', '.woff', '.woff2', '.ttc', '.fon'];
const imageList = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tif', '.tiff'];
const ipaList = ['.ipa'];
const keynoteList = ['.key'];
const linkList = ['.lnk', '.url', '.webloc'];
const mindmapList = ['.xmind', '.mm', '.mindnode', '.emmx'];
const noteList = ['.enex', '.notes', '.one'];
const numbersList = ['.numbers'];
const pagesList = ['.pages'];
const pdfList = ['.pdf'];
const pkgList = ['.pkg'];
const pptList = ['.ppt', '.pptx', '.pps', '.ppsx', '.pot', '.odp'];
const psList = ['.psd'];
const rarList = ['.rar'];
const sketchList = ['.sketch'];
const txtList = ['.txt', '.md', '.log', '.ini', '.conf', '.cfg', '.info'];
const videoList = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.mpeg', '.mpg', '.3gp', '.rmvb'];
const xlsList = ['.xls', '.xlsx', '.csv', '.et', '.xlt', '.ods'];
const zipList = ['.zip', '.7z', '.tar', '.gz', '.bz2', '.iso', '.cab', '.jar'];

const extensionMap = {
  ai: aiList,
  apk: apkList,
  audio: audioList,
  bak: bakList,
  code: codeList,
  dmg: dmgList,
  doc: docList,
  exe: exeList,
  font: fontList,
  image: imageList,
  ipa: ipaList,
  keynote: keynoteList,
  link: linkList,
  mindmap: mindmapList,
  note: noteList,
  numbers: numbersList,
  pages: pagesList,
  pdf: pdfList,
  pkg: pkgList,
  ppt: pptList,
  ps: psList,
  rar: rarList,
  sketch: sketchList,
  txt: txtList,
  video: videoList,
  xls: xlsList,
  zip: zipList,
};

// 不全部使用json因为：一个文件解析Form-data会变字符串！！！  但是api文档就写List
const SchemaData = Type.Object({
  files: Type.Union([
    Type.Array(Type.String()),
    Type.String(),
  ]),
  name: Optional(Type.String()),
  thumb_path: Optional(Type.String()),
});
type Payload = Static<typeof SchemaData>;

export class CreateFlashTask extends OneBotAction<Payload, unknown> {
  override actionName = ActionName.CreateFlashTask;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    let iconName: string;
    const qqPath = process.env['NAPCAT_WRAPPER_PATH'] || '';

    const fileList = Array.isArray(payload.files) ? payload.files : [payload.files];
    let thumbPath: string = '';

    if (fileList.length === 1) {
      // 我是真没hook到那种合并的缩略图是哪个方法产生的，暂时不实现(怀疑是js直接canvas渲染的！！)
      const filePath = fileList[0];
      if (filePath === undefined) {
        return {};
      }
      const ext = path.extname(filePath).toLowerCase();

      if (richMediaList.includes(ext)) {
        try {
          const res = await this.core.apis.FlashApi.createFileThumbnail(filePath);
          if (res && typeof res === 'object' && 'result' in res && res.result === 0) {
            thumbPath = res.targetPath as string;
          }
        } catch (_e) {
        }
      } else {
        let isDir = false;

        try {
          const stat = await fs.promises.stat(filePath);
          isDir = stat.isDirectory();
        } catch {
        }

        if (isDir) {
          iconName = 'folder';
        } else {
          iconName = Object.keys(extensionMap).find(key => extensionMap[key].includes(ext)) || 'unknown';
        }

        // const __filename = fileURLToPath(import.meta.url);
        // thumbPath = path.join(path.dirname(filePath), 'StaticThumbnail', `${iconName}.png`);  // Gemini？？？ 害我找半天错？？？
        if (qqPath !== undefined) {
          const basicPath = path.dirname(qqPath);
          thumbPath = path.join(basicPath, 'resource', 'fileIcon', `${iconName}.png`);
        }
      }
    } else {
      iconName = 'multi_files';
      if (qqPath !== undefined) {
        const basicPath = path.dirname(qqPath);
        thumbPath = path.join(basicPath, 'resource', 'fileIcon', `${iconName}.png`);
      }
    }

    function toPlatformPath (inputPath: string) {
      const unifiedPath = inputPath.replace(/[\\/]/g, path.sep);
      return path.normalize(unifiedPath);
    }

    let normalPath: string;
    if (payload.thumb_path !== undefined) {
      normalPath = path.normalize(payload.thumb_path);
    } else {
      normalPath = toPlatformPath(thumbPath);
    }
    return await this.core.apis.FlashApi.createFlashTransferUploadTask(fileList, normalPath, payload.name || '');
  }
}
