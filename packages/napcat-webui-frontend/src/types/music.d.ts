export interface Ar {
  id: number
  name: string
  tns: number[]
  alias: string[]
}

export interface Al {
  id: number
  name: string
  picUrl: string
  tns: number[]
  pic_str: string
  pic: number
}

export interface H {
  br: number
  fid: number
  size: number
  vd: number
  sr: number
}

export interface M {
  br: number
  fid: number
  size: number
  vd: number
  sr: number
}

export interface L {
  br: number
  fid: number
  size: number
  vd: number
  sr: number
}

export interface Sq {
  br: number
  fid: number
  size: number
  vd: number
  sr: number
}

export interface Song {
  name: string
  id: number
  pst: number
  t: number
  ar: Ar[]
  alia?: string[]
  pop: number
  st: number
  rt?: string
  fee: number
  v: number
  crbt?: string
  cf: string
  al: Al
  dt: number
  h: H
  m: M
  l: L
  sq: Sq
  hr?: string
  a?: string
  cd: string
  no: number
  rtUrl?: string
  ftype: number
  rtUrls: string[]
  djId: number
  copyright: number
  s_id: number
  mark: number
  originCoverType: number
  originSongSimpleData?: string
  tagPicList?: string
  resourceState: boolean
  version: number
  songJumpInfo?: string
  entertainmentTags?: string
  awardTags?: string
  single: number
  noCopyrightRcmd?: string
  mv: number
  rtype: number
  rurl?: string
  mst: number
  cp: number
  publishTime: number
}

export interface FreeTrialPrivilege {
  resConsumable: boolean
  userConsumable: boolean
  listenType?: string
  cannotListenReason: number
  playReason?: string
  freeLimitTagType?: string
}

export interface ChargeInfoList {
  rate: number
  chargeUrl?: string
  chargeMessage?: string
  chargeType: number
}

export interface Privilege {
  id: number
  fee: number
  payed: number
  st: number
  pl: number
  dl: number
  sp: number
  cp: number
  subp: number
  cs: boolean
  maxbr: number
  fl: number
  toast: boolean
  flag: number
  preSell: boolean
  playMaxbr: number
  downloadMaxbr: number
  maxBrLevel: string
  playMaxBrLevel: string
  downloadMaxBrLevel: string
  plLevel: string
  dlLevel: string
  flLevel: string
  rscl: number
  freeTrialPrivilege: FreeTrialPrivilege
  rightSource: number
  chargeInfoList: ChargeInfoList[]
  code: number
  message?: string
}

export interface Music163ListResponse {
  songs: Song[]
  privileges: Privilege[]
  code: number
}

export interface FreeTimeTrialPrivilege {
  resConsumable: boolean
  userConsumable: boolean
  type: number
  remainTime: number
}

export interface Data {
  id: number
  url: string
  br: number
  size: number
  md5: string
  code: number
  expi: number
  type: string
  gain: number
  peak: number
  closedGain: number
  closedPeak: number
  fee: number
  uf?: string
  payed: number
  flag: number
  canExtend: boolean
  freeTrialInfo?: string
  level: string
  encodeType: string
  channelLayout?: string
  freeTrialPrivilege: FreeTrialPrivilege
  freeTimeTrialPrivilege: FreeTimeTrialPrivilege
  urlSource: number
  rightSource: number
  podcastCtrp?: string
  effectTypes?: string
  time: number
  message?: string
  levelConfuse?: string
  musicId: string
}

export interface Music163URLResponse {
  data: Data[]
  code: number
}

export interface FinalMusic {
  url: string
  title: string
  artist: string
  cover: string
  id: number
}
