import json
import os
from pathlib import Path
import plistlib
import re
import shutil
import signal
import subprocess
import sys
import time


application = Path(sys.argv[1]).resolve()
distribution = Path(sys.argv[2]).resolve()
evidence = Path('qq-runtime-evidence')
evidence.mkdir(exist_ok=True)
signature = subprocess.run(['/usr/bin/codesign', '-d', '--entitlements', '-', str(application)],
                           capture_output=True, check=True, timeout=20)
entitlements = plistlib.loads(signature.stdout)
(evidence / 'entitlements.plist').write_bytes(signature.stdout)
(evidence / 'signature.txt').write_bytes(signature.stderr)
print(json.dumps({'entitlements': entitlements}, ensure_ascii=False), flush=True)

documents = Path.home() / 'Library/Containers/com.tencent.qq/Data/Documents'
runtime = documents / 'napcat-runtime-audit'
runtime.mkdir(parents=True, exist_ok=True)
shutil.copytree(distribution, runtime / 'napcat', dirs_exist_ok=True)
bootstrap = runtime / 'loader.cjs'
bootstrap.write_text('''const path = require('node:path');
const { pathToFileURL } = require('node:url');
const addon = { exports: {} };
process.dlopen(addon, path.join(__dirname, 'napcat/native/ffmpeg', `ffmpegAddon.darwin.${process.arch}.node`));
console.log('QQ_NATIVE_ADDON_PROBE', Object.keys(addon.exports));
import(pathToFileURL(path.join(__dirname, 'napcat/napcat.mjs')).href);
''')
package_path = application / 'Contents/Resources/app/package.json'
package = json.loads(package_path.read_text())
assert package['version'] == '7.0.2-53644', package
package['main'] = os.path.relpath(bootstrap, package_path.parent)
package_path.write_text(json.dumps(package))
executable = application / 'Contents/MacOS/QQ'
raw_log = evidence / 'runtime.log'
started = time.monotonic()
with raw_log.open('w') as output:
    process = subprocess.Popen([str(executable), '--no-sandbox'], cwd=runtime, start_new_session=True,
                               stdout=output, stderr=subprocess.STDOUT)
    try:
        deadline = time.monotonic() + 35
        while process.poll() is None and time.monotonic() < deadline:
            time.sleep(0.5)
        premature_exit = process.poll()
    finally:
        if process.poll() is None:
            os.killpg(process.pid, signal.SIGTERM)
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                os.killpg(process.pid, signal.SIGKILL)
                process.wait(timeout=5)
log = raw_log.read_text(errors='replace')
log = re.sub(r'(?i)(token[=:]\s*)[^\s]+', r'\1[redacted]', log)
raw_log.write_text(log)
checks = {
    'remains_running': premature_exit is None,
    'external_native_module': 'QQ_NATIVE_ADDON_PROBE' in log,
    'napcat_started': 'NapCat.Core Version:' in log,
    'packet_hook_initialized': '[PacketHandler] 初始化成功' in log,
    'napi_module_loaded': '[Napi2NativeLoader] 加载成功' in log,
    'ffmpeg_native_available': '使用 Native Addon 适配器' in log,
}
result = {'exit_code': premature_exit, 'seconds': time.monotonic() - started, 'checks': checks}
(evidence / 'result.json').write_text(json.dumps(result, indent=2))
print(log[-16000:], flush=True)
print(json.dumps(result, ensure_ascii=False), flush=True)
assert all(checks.values()), result
