import { require_dlopen } from './index';
export function pty_loader () {
  let pty: any;
  try {
    pty = require_dlopen('./native/pty/' + process.platform + '.' + process.arch + '/pty.node');
  } catch {
    pty = undefined;
  }
  return pty;
}
