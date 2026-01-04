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
  const chromeless = !!props.options?.chromeless;
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
      backgroundColor: 'transparent !important',
    },
    "&.cm-editor": {
      backgroundColor: 'transparent !important',
    },
    ".cm-scroller": {
      fontFamily: "var(--font-family-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace)",
      lineHeight: "1.6",
      overflow: "auto !important",
      height: "100% !important",
      backgroundColor: 'transparent !important',
    },
    ".cm-gutters": {
      backgroundColor: "transparent !important",
      borderRight: "none",
      color: isDark
        ? 'hsl(var(--heroui-foreground-500) / 0.75)'
        : 'hsl(var(--heroui-foreground-500) / 0.65)',
    },
    ".cm-gutterElement": {
      paddingLeft: "12px",
      paddingRight: "12px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: 'transparent !important',
      color: isDark
        ? 'hsl(var(--heroui-foreground) / 0.9) !important'
        : 'hsl(var(--heroui-foreground) / 0.8) !important',
    },
    ".cm-content": {
      color: 'hsl(var(--heroui-foreground) / 0.9)',
      caretColor: 'hsl(var(--heroui-foreground) / 0.9)',
      paddingTop: "12px",
      paddingBottom: "12px",
      backgroundColor: 'transparent !important',
    },
    ".cm-activeLine": {
      backgroundColor: isDark
        ? 'hsl(var(--heroui-foreground) / 0.08)'
        : 'hsl(var(--heroui-foreground) / 0.06)',
    },
    ".cm-selectionMatch": {
      backgroundColor: isDark
        ? 'hsl(var(--heroui-foreground) / 0.16)'
        : 'hsl(var(--heroui-foreground) / 0.12)',
    },
    // Syntax highlighting overrides for better readability
    ".ͼo": {
      // JSON property names - use a softer primary color
      color: isDark
        ? 'hsl(var(--heroui-primary) / 0.85)'
        : 'hsl(var(--heroui-primary) / 0.75)',
    },
    ".ͼd": {
      // Strings - softer green
      color: isDark ? '#98c379cc' : '#50a14fcc',
    },
    ".ͼc": {
      // Numbers - softer orange
      color: isDark ? '#d19a66cc' : '#c18401cc',
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
        chromeless
          ? 'overflow-hidden transition-colors bg-transparent'
          : 'rounded-xl border overflow-hidden transition-colors backdrop-blur-sm',
        !chromeless && (isDark
          ? 'border-white/10 bg-white/5 text-default-100'
          : 'border-white/40 dark:border-white/10 bg-white/60 dark:bg-black/20 text-default-700')
      )}
    >
      <CodeMirror
        ref={internalRef}
        value={props.value ?? props.defaultValue}
        height="100%"
        className="h-full w-full [&_.cm-editor]:!bg-transparent [&_.cm-scroller]:!bg-transparent"
        style={{ backgroundColor: 'transparent' }}
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
