import Quill from 'quill'
import 'quill/dist/quill.core.css'
import { useEffect, useRef, useState } from 'react'

interface UseCustomQuillProps {
  modules: Record<string, unknown>
  formats: string[]
  placeholder: string
}

export const useCustomQuill = ({
  modules,
  formats,
  placeholder
}: UseCustomQuillProps) => {
  const quillRef = useRef<HTMLDivElement | null>(null)
  const [quill, setQuill] = useState<Quill | null>(null)

  useEffect(() => {
    if (quillRef.current) {
      const quillInstance = new Quill(quillRef.current, {
        modules,
        formats,
        placeholder
      })
      setQuill(quillInstance)
    }
  }, [])

  return { quillRef, quill, Quill }
}
