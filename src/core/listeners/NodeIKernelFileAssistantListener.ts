export class NodeIKernelFileAssistantListener {
  onFileStatusChanged (_fileStatus: {
    id: string,
    fileStatus: number,
    fileProgress: `${number}`,
    fileSize: `${number}`,
    fileSpeed: number,
    thumbPath: string | null,
    filePath: string | null,
  }): any {
  }

  onSessionListChanged (..._args: unknown[]): any {
  }

  onSessionChanged (..._args: unknown[]): any {
  }

  onFileListChanged (..._args: unknown[]): any {
  }

  onFileSearch (_searchResult: SearchResultWrapper): any {
  }
}

export type SearchResultWrapper = {
  searchId: number,
  resultId: number,
  hasMore: boolean,
  resultItems: SearchResultItem[],
};

export type SearchResultItem = {
  id: string,
  fileName: string,
  fileNameHits: string[],
  fileStatus: number,
  fileSize: string,
  isSend: boolean,
  source: number,
  fileTime: string,
  expTime: string,
  session: {
    context: null,
    uid: string,
    nick: string,
    remark: string,
    memberCard: string,
    groupCode: string,
    groupName: string,
    groupRemark: string,
    count: number,
  },
  thumbPath: string,
  filePath: string,
  msgId: string,
  chatType: number,
  peerUid: string,
  fileType: number,
};
