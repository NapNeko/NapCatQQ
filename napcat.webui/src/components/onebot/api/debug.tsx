import { Button } from '@heroui/button'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Input } from '@heroui/input'
import { Snippet } from '@heroui/snippet'
import { useLocalStorage } from '@uidotdev/usehooks'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { IoLink, IoSend } from 'react-icons/io5'
import { PiCatDuotone } from 'react-icons/pi'

import key from '@/const/key'
import { OneBotHttpApiContent, OneBotHttpApiPath } from '@/const/ob_api'

import ChatInputModal from '@/components/chat_input/modal'
import CodeEditor from '@/components/code_editor'
import PageLoading from '@/components/page_loading'

import { request } from '@/utils/request'
import { parseAxiosResponse } from '@/utils/url'
import { generateDefaultJson, parse } from '@/utils/zod'

import DisplayStruct from './display_struct'

export interface OneBotApiDebugProps {
  path: OneBotHttpApiPath
  data: OneBotHttpApiContent
}

const OneBotApiDebug: React.FC<OneBotApiDebugProps> = (props) => {
  const { path, data } = props
  const currentURL = new URL(window.location.origin)
  currentURL.port = '3000'
  const defaultHttpUrl = currentURL.href
  const [httpConfig, setHttpConfig] = useLocalStorage(key.httpDebugConfig, {
    url: defaultHttpUrl,
    token: ''
  })
  const [requestBody, setRequestBody] = useState('{}')
  const [responseContent, setResponseContent] = useState('')
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false)
  const [isResponseOpen, setIsResponseOpen] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const responseRef = useRef<HTMLDivElement>(null)
  const parsedRequest = parse(data.request)
  const parsedResponse = parse(data.response)

  const sendRequest = async () => {
    if (isFetching) return
    setIsFetching(true)
    const r = toast.loading('正在发送请求...')
    try {
      const parsedRequestBody = JSON.parse(requestBody)
      const requestURL = new URL(httpConfig.url)
      requestURL.pathname = path
      request
        .post(requestURL.href, parsedRequestBody, {
          headers: {
            Authorization: `Bearer ${httpConfig.token}`
          },
          responseType: 'text'
        })
        .then((res) => {
          setResponseContent(parseAxiosResponse(res))
          toast.success('请求发送完成，请查看响应')
        })
        .catch((err) => {
          toast.error('请求发送失败：' + err.message)
          setResponseContent(parseAxiosResponse(err.response))
        })
        .finally(() => {
          setIsFetching(false)
          setIsResponseOpen(true)
          responseRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
          toast.dismiss(r)
        })
    } catch (error) {
      toast.error('请求体 JSON 格式错误')
      setIsFetching(false)
      toast.dismiss(r)
    }
  }

  useEffect(() => {
    setRequestBody(generateDefaultJson(data.request))
    setResponseContent('')
  }, [path])

  return (
    <section className="p-4 pt-14 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-1 text-primary-400">
        <PiCatDuotone />
        {data.description}
      </h1>
      <h1 className="text-lg font-bold mb-4">
        <Snippet
          className="bg-default-50 bg-opacity-50 backdrop-blur-md"
          symbol={<IoLink size={18} className="inline-block mr-1" />}
          tooltipProps={{
            content: '点击复制地址'
          }}
        >
          {path}
        </Snippet>
      </h1>
      <div className="flex gap-2 items-center">
        <Input
          label="HTTP URL"
          placeholder="输入 HTTP URL"
          value={httpConfig.url}
          onChange={(e) =>
            setHttpConfig({ ...httpConfig, url: e.target.value })
          }
        />
        <Input
          label="Token"
          placeholder="输入 Token"
          value={httpConfig.token}
          onChange={(e) =>
            setHttpConfig({ ...httpConfig, token: e.target.value })
          }
        />
        <Button
          onPress={sendRequest}
          color="primary"
          size="lg"
          radius="full"
          isIconOnly
          isDisabled={isFetching}
        >
          <IoSend />
        </Button>
      </div>
      <Card
        shadow="sm"
        className="my-4 bg-opacity-50 backdrop-blur-md overflow-visible"
      >
        <CardHeader className="font-bold text-lg gap-1 pb-0">
          <span className="mr-2">请求体</span>
          <Button
            color="warning"
            variant="flat"
            onPress={() => setIsCodeEditorOpen(!isCodeEditorOpen)}
            size="sm"
            radius="full"
          >
            {isCodeEditorOpen ? '收起' : '展开'}
          </Button>
        </CardHeader>
        <CardBody>
          <motion.div
            ref={responseRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isCodeEditorOpen ? 1 : 0,
              height: isCodeEditorOpen ? 'auto' : 0
            }}
          >
            <CodeEditor
              value={requestBody}
              onChange={(value) => setRequestBody(value ?? '')}
              language="json"
              height="400px"
            />

            <div className="flex justify-end gap-1">
              <ChatInputModal />
              <Button
                color="primary"
                variant="flat"
                onPress={() =>
                  setRequestBody(generateDefaultJson(data.request))
                }
              >
                填充示例请求体
              </Button>
            </div>
          </motion.div>
        </CardBody>
      </Card>
      <Card
        shadow="sm"
        className="my-4 relative bg-opacity-50 backdrop-blur-md"
      >
        <PageLoading loading={isFetching} />
        <CardHeader className="font-bold text-lg gap-1 pb-0">
          <span className="mr-2">响应</span>
          <Button
            color="warning"
            variant="flat"
            onPress={() => setIsResponseOpen(!isResponseOpen)}
            size="sm"
            radius="full"
          >
            {isResponseOpen ? '收起' : '展开'}
          </Button>
          <Button
            color="success"
            variant="flat"
            onPress={() => {
              navigator.clipboard.writeText(responseContent)
              toast.success('响应内容已复制到剪贴板')
            }}
            size="sm"
            radius="full"
          >
            复制
          </Button>
        </CardHeader>
        <CardBody>
          <motion.div
            className="overflow-y-auto text-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isResponseOpen ? 1 : 0,
              height: isResponseOpen ? 300 : 0
            }}
          >
            <pre>
              <code>
                {responseContent || (
                  <div className="text-gray-400">暂无响应</div>
                )}
              </code>
            </pre>
          </motion.div>
        </CardBody>
      </Card>
      <div className="p-2 md:p-4 border border-default-50 dark:border-default-200 rounded-lg backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-2">请求体结构</h2>
        <DisplayStruct schema={parsedRequest} />
        <h2 className="text-xl font-semibold mt-4 mb-2">响应体结构</h2>
        <DisplayStruct schema={parsedResponse} />
      </div>
    </section>
  )
}

export default OneBotApiDebug
