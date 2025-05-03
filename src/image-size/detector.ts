import type { imageType } from './types/index'
import { typeHandlers, types } from './types/index'

// This map helps avoid validating for every single image type
const firstBytes = new Map<number, imageType>([
  [0x00, 'heif'],
  [0x42, 'bmp'],
  [0x47, 'gif'],
  [0x49, 'tiff'],
  [0x4d, 'tiff'],
  [0x52, 'webp'],
  [0x89, 'png'],
  [0xff, 'jpg'],
])

export function detector(input: Uint8Array): imageType | undefined {
  const byte = input[0];
  if (byte === undefined) {
    return undefined
  }
  const type = firstBytes.get(byte)
  if (type && typeHandlers.get(type)!.validate(input)) {
    return type
  }
  return types.find((type) => typeHandlers.get(type)!.validate(input))
}
