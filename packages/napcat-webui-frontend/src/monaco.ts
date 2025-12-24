import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

// Monaco Environment - Only load JSON worker for performance
// Other languages will use basic editor worker (no IntelliSense, but syntax highlighting works)
self.MonacoEnvironment = {
  getWorker (_: unknown, label: string) {
    if (label === 'json') {
      // eslint-disable-next-line new-cap
      return new jsonWorker();
    }
    // For all other languages, use the basic editor worker
    // This provides syntax highlighting but no language-specific IntelliSense
    // eslint-disable-next-line new-cap
    return new editorWorker();
  },
};

export default monaco;
