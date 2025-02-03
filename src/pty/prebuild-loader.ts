import { require_dlopen } from '.';

let pty: any;

try {
    pty = require_dlopen('./pty/' + process.platform + '.' + process.arch + '/pty.node');
} catch (outerError) {
    try {
        pty = require_dlopen('./pty/' + process.platform + '.' + process.arch + '/pty.node');
    } catch (innerError) {
        console.error('innerError', innerError);
        // Re-throw the exception from the Release require if the Debug require fails as well
        throw outerError;
    }
}

export default pty;
