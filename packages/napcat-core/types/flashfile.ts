export enum fileType {
  MP3 = 1,
  VIDEO = 2,
  DOC = 3,
  ZIP = 4,
  XLS = 6,
  PPT = 7,
  CODE = 8,
  PDF = 9,
  TXT = 10,
  UNKNOW = 11,
  FOLDER = 25,
  IMG = 26,
}

export enum FileStatus {
  UPLOADING = 0,
  // DOWNLOADED = 1,  ???  不太清楚
  OK = 2,
  STOP = 3,
}
