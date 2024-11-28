import type {
  GirhubRepo,
  GithubContributor,
  GithubPullRequest,
  GithubRelease as GithubReleaseType
} from '@/types/github'

import { Image } from '@nextui-org/image'
import { Listbox, ListboxItem } from '@nextui-org/listbox'
import { useRequest } from 'ahooks'
import { Spinner } from '@nextui-org/spinner'
import { MdError } from 'react-icons/md'

import packageJson from '../../../package.json'

import logo from '@/assets/images/logo.png'
import { request } from '@/utils/request'
import {
  BookIcon,
  BugIcon,
  PullRequestIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
  WatchersIcon
} from '@/components/icons'
import ItemCounter from '@/components/github_info/item_counter'
import IconWrapper from '@/components/github_info/icon_wrapper'
import GithubRelease from '@/components/github_info/release'
import { openUrl } from '@/utils/url'
import { Chip } from '@nextui-org/chip'

function VersionInfo() {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Chip
        startContent={
          <Chip color="danger" size="sm" className="-ml-0.5 select-none">
            WebUI
          </Chip>
        }
      >
        {packageJson.version}
      </Chip>
    </div>
  )
}

function displayData(data: number, loading: boolean, error?: Error) {
  if (error) {
    return <MdError className="text-danger-400" />
  }

  if (loading) {
    return <Spinner size="sm" />
  }

  return <ItemCounter number={data} />
}

export default function AboutPage() {
  // repo info
  const {
    data: repoOriData,
    error: repoError,
    loading: repoLoading
  } = useRequest(() =>
    request.get<GirhubRepo>('https://api.github.com/repos/NapNeko/NapCatQQ')
  )

  // release info
  const {
    data: releaseOriData,
    error: releaseError,
    loading: releaseLoading
  } = useRequest(() =>
    request.get<GithubReleaseType[]>(
      'https://api.github.com/repos/NapNeko/NapCatQQ/releases'
    )
  )

  // pr info
  const {
    data: prData,
    error: prError,
    loading: prLoading
  } = useRequest(() =>
    request.get<GithubPullRequest[]>(
      'https://api.github.com/repos/NapNeko/NapCatQQ/pulls'
    )
  )

  // contributors info
  const {
    data: contributorsData,
    error: contributorsError,
    loading: contributorsLoading
  } = useRequest(() =>
    request.get<GithubContributor[]>(
      'https://api.github.com/repos/NapNeko/NapCatQQ/contributors'
    )
  )

  const repoData = repoOriData?.data
  const releaseData = releaseOriData?.data?.[0]
  const prCount = prData?.data?.length || 0
  const contributorsCount = contributorsData?.data?.length || 0

  const releaseCount = releaseOriData?.data?.length || 0

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="max-w-full w-96 mx-3 flex flex-col items-center">
        <div className="flex items-center gap-2">
          <Image alt="logo" className="-mt-5" height="8em" src={logo} />
        </div>
        <VersionInfo />
        <Listbox
          aria-label="User Menu"
          className="p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 max-w-[300px] overflow-visible shadow-small rounded-medium"
          itemClasses={{
            base: 'px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80'
          }}
          onAction={(key: React.Key) => {
            switch (key) {
              case 'releases':
                openUrl('https://github.com/NapNeko/NapCatQQ/releases', true)
                break
              case 'contributors':
                openUrl(
                  'https://github.com/NapNeko/NapCatQQ/graphs/contributors',
                  true
                )
                break
              case 'license':
                openUrl(
                  'https://github.com/NapNeko/NapCatQQ/blob/main/LICENSE',
                  true
                )
                break
              case 'watchers':
                openUrl('https://github.com/NapNeko/NapCatQQ/watchers', true)
                break
              case 'star':
                openUrl('https://github.com/NapNeko/NapCatQQ/stargazers', true)
                break
              case 'issues':
                openUrl('https://github.com/NapNeko/NapCatQQ/issues', true)
                break
              case 'pull_requests':
                openUrl('https://github.com/NapNeko/NapCatQQ/pulls', true)
                break
              default:
                openUrl('https://github.com/NapNeko/NapCatQQ', true)
            }
          }}
        >
          <ListboxItem
            key="star"
            endContent={displayData(
              repoData?.stargazers_count ?? 0,
              false,
              repoError
            )}
            startContent={
              <IconWrapper className="bg-success/10 text-success">
                <StarIcon className="text-lg" />
              </IconWrapper>
            }
          >
            Star
          </ListboxItem>
          <ListboxItem
            key="issues"
            endContent={displayData(
              repoData?.open_issues_count ?? 0,
              false,
              repoError
            )}
            startContent={
              <IconWrapper className="bg-success/10 text-success">
                <BugIcon className="text-lg" />
              </IconWrapper>
            }
          >
            Issues
          </ListboxItem>
          <ListboxItem
            key="pull_requests"
            endContent={displayData(prCount, prLoading, prError)}
            startContent={
              <IconWrapper className="bg-primary/10 text-primary">
                <PullRequestIcon className="text-lg" />
              </IconWrapper>
            }
          >
            Pull Requests
          </ListboxItem>
          <ListboxItem
            key="releases"
            className="group h-auto py-3"
            endContent={
              releaseError ? (
                <MdError className="text-danger-400" />
              ) : releaseLoading ? (
                <Spinner size="sm" />
              ) : (
                <ItemCounter number={releaseCount} />
              )
            }
            startContent={
              <IconWrapper className="bg-primary/10 text-primary">
                <TagIcon className="text-lg" />
              </IconWrapper>
            }
            textValue="Releases"
          >
            {releaseData && <GithubRelease releaseData={releaseData} />}
          </ListboxItem>
          <ListboxItem
            key="contributors"
            endContent={displayData(
              contributorsCount,
              contributorsLoading,
              contributorsError
            )}
            startContent={
              <IconWrapper className="bg-warning/10 text-warning">
                <UsersIcon />
              </IconWrapper>
            }
          >
            Contributors
          </ListboxItem>
          <ListboxItem
            key="watchers"
            endContent={displayData(
              repoData?.watchers_count ?? 0,
              repoLoading,
              repoError
            )}
            startContent={
              <IconWrapper className="bg-default/50 text-foreground">
                <WatchersIcon />
              </IconWrapper>
            }
          >
            Watchers
          </ListboxItem>
          <ListboxItem
            key="license"
            endContent={
              <span className="text-small text-default-400">
                {repoData?.license?.name ?? 'unknown'}
              </span>
            }
            startContent={
              <IconWrapper className="bg-danger/10 text-danger dark:text-danger-500">
                <BookIcon />
              </IconWrapper>
            }
          >
            License
          </ListboxItem>
        </Listbox>
      </div>
    </section>
  )
}
