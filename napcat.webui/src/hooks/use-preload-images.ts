import { useEffect, useRef, useState } from 'react'

// 全局图片缓存
const imageCache = new Map<string, HTMLImageElement>()

export function usePreloadImages(urls: string[]) {
  const [loadedUrls, setLoadedUrls] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true

    // 检查是否所有图片都已缓存
    const allCached = urls.every((url) => imageCache.has(url))
    if (allCached) {
      setLoadedUrls(urls.reduce((acc, url) => ({ ...acc, [url]: true }), {}))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const loadedImages: Record<string, boolean> = {}
    let pendingCount = urls.length

    urls.forEach((url) => {
      // 如果已经缓存，直接标记为已加载
      if (imageCache.has(url)) {
        loadedImages[url] = true
        pendingCount--
        if (pendingCount === 0) {
          setLoadedUrls(loadedImages)
          setIsLoading(false)
        }
        return
      }

      const img = new Image()
      img.onload = () => {
        if (!isMounted.current) return
        loadedImages[url] = true
        imageCache.set(url, img)
        pendingCount--

        if (pendingCount === 0) {
          setLoadedUrls(loadedImages)
          setIsLoading(false)
        }
      }
      img.onerror = () => {
        if (!isMounted.current) return
        loadedImages[url] = false
        pendingCount--

        if (pendingCount === 0) {
          setLoadedUrls(loadedImages)
          setIsLoading(false)
        }
      }
      img.src = url
    })

    return () => {
      isMounted.current = false
    }
  }, [urls])

  return { loadedUrls, isLoading }
}
