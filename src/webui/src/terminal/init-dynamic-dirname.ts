import path from 'path';
import { fileURLToPath } from 'url';

export function callsites () {
  const _prepareStackTrace = Error.prepareStackTrace;
  try {
    let result: NodeJS.CallSite[] = [];
    Error.prepareStackTrace = (_, callSites) => {
      const callSitesWithoutCurrent = callSites.slice(1);
      result = callSitesWithoutCurrent;
      return callSitesWithoutCurrent;
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    new Error().stack;
    return result;
  } finally {
    Error.prepareStackTrace = _prepareStackTrace;
  }
}

Object.defineProperty(global, '__dirname', {
  get () {
    const sites = callsites();
    const file = sites?.[1]?.getFileName();
    if (file) {
      return path.dirname(fileURLToPath(file));
    }
    return '';
  },
});
