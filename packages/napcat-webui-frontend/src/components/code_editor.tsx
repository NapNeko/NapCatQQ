import React, { useImperativeHandle, useEffect, useState } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { useTheme } from '@/hooks/use-theme';
import { EditorView } from '@codemirror/view';
import clsx from 'clsx';

const getLanguageExtension = (lang?: string) => {
  switch (lang) {
    case 'json': return json();
    default: return [];
  }
};

export interface CodeEditorProps {
  value?: string;
  defaultValue?: string;
  language?: string;
  defaultLanguage?: string;
  onChange?: (value: string | undefined) => void;
  height?: string;
  options?: any;
  onMount?: any;
}

export interface CodeEditorRef {
  getValue: () => string;
}

const CodeEditor = React.forwardRef<CodeEditorRef, CodeEditorProps>((props, ref) => {
  const { isDark } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [val, setVal] = useState(props.value || props.defaultValue || '');
  const internalRef = React.useRef<ReactCodeMirrorRef>(null);

  useEffect(() => {
    if (props.value !== undefined) {
      setVal(props.value);
    }
  }, [props.value]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      // Prefer getting dynamic value from view, fallback to state
      return internalRef.current?.view?.state.doc.toString() || val;
    }
  }));

  const customTheme = EditorView.theme({
    "&": {
      fontSize: "14px",
      height: "100% !important",
    },
    ".cm-scroller": {
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      lineHeight: "1.6",
      overflow: "auto !important",
      height: "100% !important",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      borderRight: "none",
      color: isDark ? "#ffffff50" : "#00000040",
    },
    ".cm-gutterElement": {
      paddingLeft: "12px",
      paddingRight: "12px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: isDark ? "#fff" : "#000",
    },
    ".cm-content": {
      caretColor: isDark ? "#fff" : "#000",
      paddingTop: "12px",
      paddingBottom: "12px",
    },
    ".cm-activeLine": {
      backgroundColor: isDark ? "#ffffff10" : "#00000008",
    },
    ".cm-selectionMatch": {
      backgroundColor: isDark ? "#ffffff20" : "#00000010",
    },
  });

  const extensions = [
    customTheme,
    getLanguageExtension(props.language || props.defaultLanguage),
    props.options?.wordWrap === 'on' ? EditorView.lineWrapping : [],
    props.options?.readOnly ? EditorView.editable.of(false) : [],
  ].flat();

  return (
    <div
      style={{ fontSize: props.options?.fontSize || 14, height: props.height || '100%', display: 'flex', flexDirection: 'column' }}
      className={clsx(
        'rounded-xl border overflow-hidden transition-colors',
        isDark
          ? 'border-white/10 bg-[#282c34]'
          : 'border-default-200 bg-white'
      )}
    >
      <CodeMirror
        ref={internalRef}
        value={props.value ?? props.defaultValue}
        height="100%"
        className="h-full w-full"
        theme={isDark ? oneDark : 'light'}
        extensions={extensions}
        onChange={(value) => {
          setVal(value);
          props.onChange?.(value);
        }}
        readOnly={props.options?.readOnly}
        basicSetup={{
          lineNumbers: props.options?.lineNumbers !== 'off',
          foldGutter: props.options?.folding !== false,
          highlightActiveLine: props.options?.renderLineHighlight !== 'none',
        }}
      />
    </div>
  );
});

export default CodeEditor;
