import { Image } from '@heroui/image'
import React from 'react'

import bkg_color from '@/assets/images/bkg-color.png'

const PageBackground = () => {
  return (
    <React.Fragment>
      <div className="fixed w-full h-full -z-[0] flex justify-end opacity-80">
        <Image
          className="overflow-hidden object-contain -top-42 h-[160%] -right-[30%] -rotate-45 pointer-events-none select-none -z-10 relative"
          src={bkg_color}
        />
      </div>
      <div className="fixed w-full h-full overflow-hidden -z-[0] hue-rotate-90 flex justify-start opacity-80">
        <Image
          className="relative -top-92 h-[180%] object-contain pointer-events-none rotate-90 select-none -z-10 top-44"
          src={bkg_color}
        />
      </div>
    </React.Fragment>
  )
}

export default PageBackground
