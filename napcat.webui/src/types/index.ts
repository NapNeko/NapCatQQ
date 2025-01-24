import { ImgHTMLAttributes, SVGProps } from 'react'

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number
}

export type IconImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  size?: number
}
