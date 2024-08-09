import { OB11GroupNoticeEvent } from './OB11GroupNoticeEvent';

export interface GroupUploadFile{
    id: string,
    name: string,
    size: number,
    busid: number,
}

export class OB11GroupUploadNoticeEvent extends OB11GroupNoticeEvent {
    notice_type = 'group_upload';
    file: GroupUploadFile;

    constructor(groupId: number, userId: number, file: GroupUploadFile) {
        super();
        this.group_id = groupId;
        this.user_id = userId;
        this.file = file;
    }
}