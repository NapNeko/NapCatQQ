import Editor, { OnMount } from '@monaco-editor/react'
import { loader } from '@monaco-editor/react'
import React from 'react'

import { useTheme } from '@/hooks/use-theme'

import monaco from '@/monaco'

loader.config({
  monaco,
  paths: {
    vs: '/webui/monaco-editor/min/vs'
  }
})

loader.config({
  'vs/nls': {
    availableLanguages: { '*': 'zh-cn' }
  }
})

export interface CodeEditorProps extends React.ComponentProps<typeof Editor> {
  test?: string
}

export type CodeEditorRef = monaco.editor.IStandaloneCodeEditor

const CodeEditor = React.forwardRef<CodeEditorRef, CodeEditorProps>(
  (props, ref) => {
    const { isDark } = useTheme()

    const handleEditorDidMount: OnMount = (editor, monaco) => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(editor)
        } else {
          ;(ref as React.RefObject<CodeEditorRef>).current = editor
        }
      }
      if (props.onMount) {
        props.onMount(editor, monaco)
      }
    }

    return (
      <Editor
        {...props}
        onMount={handleEditorDidMount}
        theme={isDark ? 'vs-dark' : 'light'}
      />
    )
  }
)

export default CodeEditor
