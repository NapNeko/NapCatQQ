import { Card, CardBody } from '@heroui/card'
import { Input } from '@heroui/input'
import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'

import SaveButtons from '@/components/button/save_buttons'
import ImageInput from '@/components/input/image_input'

import { siteConfig } from '@/config/site'

export interface WebUIConfigCardProps {
  control: Control<IConfig['webui']>
  onSubmit: () => void
  reset: () => void
  isSubmitting: boolean
  onRefresh: () => void
}
const WebUIConfigCard: React.FC<WebUIConfigCardProps> = (props) => {
  const { control, onSubmit, reset, isSubmitting, onRefresh } = props
  return (
    <>
      <title>WebUI配置 - NapCat WebUI</title>
      <Card className="bg-opacity-50 backdrop-blur-sm">
        <CardBody className="items-center py-5">
          <div className="w-96 max-w-full flex flex-col gap-2">
            <Controller
              control={control}
              name="musicListID"
              render={({ field }) => (
                <Input
                  {...field}
                  label="网易云音乐歌单ID（网页内音乐播放器）"
                  placeholder="请输入歌单ID"
                />
              )}
            />
            <div className="flex flex-col gap-2">
              <div className="flex-shrink-0 w-full">背景图</div>
              <Controller
                control={control}
                name="background"
                render={({ field }) => <ImageInput {...field} />}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div>自定义图标</div>
              {siteConfig.navItems.map((item) => (
                <Controller
                  key={item.label}
                  control={control}
                  name={`customIcons.${item.label}`}
                  render={({ field }) => (
                    <ImageInput {...field} label={item.label} />
                  )}
                />
              ))}
            </div>
            <SaveButtons
              onSubmit={onSubmit}
              reset={reset}
              isSubmitting={isSubmitting}
              refresh={onRefresh}
            />
          </div>
        </CardBody>
      </Card>
    </>
  )
}

export default WebUIConfigCard
