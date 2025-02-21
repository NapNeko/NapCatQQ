import { motion, useMotionValue, useSpring } from 'motion/react'
import { useRef, useState } from 'react'

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2
}

export interface HoverTiltedCardProps {
  imageSrc: string
  altText?: string
  captionText?: string
  containerHeight?: string
  containerWidth?: string
  imageHeight?: string
  imageWidth?: string
  scaleOnHover?: number
  rotateAmplitude?: number
  showTooltip?: boolean
  overlayContent?: React.ReactNode
  displayOverlayContent?: boolean
}

export default function HoverTiltedCard({
  imageSrc,
  altText = 'NapCat',
  captionText = 'NapCat',
  containerHeight = '200px',
  containerWidth = '100%',
  imageHeight = '200px',
  imageWidth = '200px',
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showTooltip = false,
  overlayContent = (
    <div className="text-center mt-6 px-4 py-0.5 shadow-lg rounded-full bg-primary-600 text-default-100 bg-opacity-80">
      NapCat
    </div>
  ),
  displayOverlayContent = true
}: HoverTiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useMotionValue(0), springValues)
  const rotateY = useSpring(useMotionValue(0), springValues)
  const scale = useSpring(1, springValues)
  const opacity = useSpring(0)
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1
  })

  const [lastY, setLastY] = useState(0)

  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - rect.width / 2
    const offsetY = e.clientY - rect.top - rect.height / 2

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude

    rotateX.set(rotationX)
    rotateY.set(rotationY)

    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)

    const velocityY = offsetY - lastY
    rotateFigcaption.set(-velocityY * 0.6)
    setLastY(offsetY)
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover)
    opacity.set(1)
  }

  function handleMouseLeave() {
    opacity.set(0)
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
    rotateFigcaption.set(0)
  }

  return (
    <figure
      ref={ref}
      className="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center"
      style={{
        height: containerHeight,
        width: containerWidth
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative [transform-style:preserve-3d]"
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale
        }}
      >
        <motion.img
          src={imageSrc}
          alt={altText}
          className="absolute top-0 left-0 object-cover rounded-md will-change-transform [transform:translateZ(0)] pointer-events-none select-none"
          style={{
            width: imageWidth,
            height: imageHeight
          }}
        />

        {displayOverlayContent && overlayContent && (
          <motion.div className="absolute top-0 left-0 right-0 z-10 flex justify-center will-change-transform [transform:translateZ(30px)]">
            {overlayContent}
          </motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 rounded-md bg-white px-2 py-1 text-sm text-default-900 opacity-0 z-10 hidden sm:block"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption
          }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  )
}
