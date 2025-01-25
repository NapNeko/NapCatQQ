import { useEffect, useState } from 'react'

import { getReleaseTime } from '@/utils/time'

import type { GithubRelease as GithubReleaseType } from '@/types/github'

export interface GithubReleaseProps {
  releaseData: GithubReleaseType
}
const GithubRelease: React.FC<GithubReleaseProps> = (props) => {
  const { releaseData } = props
  const [releaseTime, setReleaseTime] = useState<string | null>(null)

  useEffect(() => {
    if (releaseData) {
      const timer = setInterval(() => {
        const time = getReleaseTime(releaseData.published_at)

        setReleaseTime(time)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [releaseData])

  return (
    <div className="flex flex-col gap-1">
      <span>Releases</span>
      <div className="px-2 py-1 rounded-small bg-default-100 bg-opacity-50 backdrop-blur-sm group-data-[hover=true]:bg-default-200">
        <span className="text-tiny text-default-600">{releaseData.name}</span>
        <div className="flex gap-2 text-tiny">
          <span className="text-default-500">{releaseTime}</span>
          <span className="text-success">Latest</span>
        </div>
      </div>
    </div>
  )
}

export default GithubRelease
