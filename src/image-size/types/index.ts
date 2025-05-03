// load all available handlers explicitly for browserify support
import { BMP } from './bmp'
import { GIF } from './gif'
import { HEIF } from './heif'
import { JPG } from './jpg'
import { PNG } from './png'
import { TIFF } from './tiff'
import { WEBP } from './webp'

export const typeHandlers = new Map([
  ['bmp', BMP],
  ['gif', GIF],
  ['heif', HEIF],
  ['jpg', JPG],
  ['png', PNG],
  ['tiff', TIFF],
  ['webp', WEBP],
] as const)

export const types = Array.from(typeHandlers.keys())
export type imageType = (typeof types)[number]
