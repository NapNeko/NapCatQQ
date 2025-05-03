import { detector } from './detector'
import type { imageType } from './types/index'
import { typeHandlers } from './types/index'
import type { ISizeCalculationResult } from './types/interface'

type Options = {
  disabledTypes: imageType[]
}

const globalOptions: Options = {
  disabledTypes: [],
}

/**
 * Return size information based on an Uint8Array
 *
 * @param {Uint8Array} input
 * @returns {ISizeCalculationResult}
 */
export function imageSize(input: Uint8Array): ISizeCalculationResult {
  // detect the file type... don't rely on the extension
  const type = detector(input)

  if (typeof type !== 'undefined') {
    if (globalOptions.disabledTypes.indexOf(type) > -1) {
      throw new TypeError(`disabled file type: ${type}`)
    }

    // find an appropriate handler for this file type
    const size = typeHandlers.get(type)!.calculate(input)
    if (size !== undefined) {
      size.type = size.type ?? type

      // If multiple images, find the largest by area
      if (size.images && size.images.length > 1) {
        const largestImage = size.images.reduce((largest: any, current: { width: number; height: number }) => {
          return current.width * current.height > largest!.width * largest!.height
            ? current
            : largest
        }, size.images[0])

        // Ensure the main result is the largest image
        size.width = largestImage!.width
        size.height = largestImage!.height
      }

      return size
    }
  }

  // throw up, if we don't understand the file
  throw new TypeError(`unsupported file type: ${type}`)
}

export const disableTypes = (types: imageType[]): void => {
  globalOptions.disabledTypes = types
}
