import { SVGProps, ImgHTMLAttributes } from 'react'

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number
}

export type IconImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  size?: number
}
