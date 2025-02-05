import { Button } from '@heroui/button'
import { Code } from '@heroui/code'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/modal'

import CodeEditor from '@/components/code_editor'

interface FileEditModalProps {
  isOpen: boolean
  file: { path: string; content: string } | null
  onClose: () => void
  onSave: () => void
  onContentChange: (newContent?: string) => void
}

export default function FileEditModal({
  isOpen,
  file,
  onClose,
  onSave,
  onContentChange
}: FileEditModalProps) {
  // 根据文件后缀返回对应语言
  const getLanguage = (filePath: string) => {
    if (filePath.endsWith('.js')) return 'javascript'
    if (filePath.endsWith('.ts')) return 'typescript'
    if (filePath.endsWith('.tsx')) return 'tsx'
    if (filePath.endsWith('.jsx')) return 'jsx'
    if (filePath.endsWith('.vue')) return 'vue'
    if (filePath.endsWith('.svelte')) return 'svelte'
    if (filePath.endsWith('.json')) return 'json'
    if (filePath.endsWith('.html')) return 'html'
    if (filePath.endsWith('.css')) return 'css'
    if (filePath.endsWith('.scss')) return 'scss'
    if (filePath.endsWith('.less')) return 'less'
    if (filePath.endsWith('.md')) return 'markdown'
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) return 'yaml'
    if (filePath.endsWith('.xml')) return 'xml'
    if (filePath.endsWith('.sql')) return 'sql'
    if (filePath.endsWith('.sh')) return 'shell'
    if (filePath.endsWith('.bat')) return 'bat'
    if (filePath.endsWith('.php')) return 'php'
    if (filePath.endsWith('.java')) return 'java'
    if (filePath.endsWith('.c')) return 'c'
    if (filePath.endsWith('.cpp')) return 'cpp'
    if (filePath.endsWith('.h')) return 'h'
    if (filePath.endsWith('.hpp')) return 'hpp'
    if (filePath.endsWith('.go')) return 'go'
    if (filePath.endsWith('.py')) return 'python'
    if (filePath.endsWith('.rb')) return 'ruby'
    if (filePath.endsWith('.cs')) return 'csharp'
    if (filePath.endsWith('.swift')) return 'swift'
    if (filePath.endsWith('.vb')) return 'vb'
    if (filePath.endsWith('.lua')) return 'lua'
    if (filePath.endsWith('.pl')) return 'perl'
    if (filePath.endsWith('.r')) return 'r'
    return 'plaintext'
  }

  return (
    <Modal size="full" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 bg-content2 bg-opacity-50">
          <span>编辑文件</span>
          <Code className="text-xs">{file?.path}</Code>
        </ModalHeader>
        <ModalBody className="p-0">
          <div className="h-full">
            <CodeEditor
              height="100%"
              value={file?.content || ''}
              onChange={onContentChange}
              options={{ wordWrap: 'on' }}
              language={file?.path ? getLanguage(file.path) : 'plaintext'}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" variant="flat" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={onSave}>
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
