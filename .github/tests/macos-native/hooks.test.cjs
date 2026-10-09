const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { join } = require('node:path');
const { test } = require('node:test');

const nativePath = join(__dirname, '../../../packages/napcat-native');
const napiPath = join(nativePath, 'napi2native', 'napi2native.darwin.' + process.arch + '.node');
const packetPath = join(nativePath, 'packet', 'MoeHoo.darwin.' + process.arch + '.node');

async function probe (mode) {
  if (mode === 'missing-wrapper') {
    const napi = require(napiPath);
    assert.throws(() => napi.initHook('1', '2'), /Failed to initialize send hook/);
    const packet = require(packetPath);
    assert.equal(packet.initHook('2', '4', () => {}, false), 'error search');
    return;
  }

  const wrapper = require('./wrapper.node');
  const addresses = wrapper.addresses();
  const napi = require(napiPath);
  assert.equal(napi.initHook(addresses.coerce, addresses.resolver), true);
  const lengths = [0, 1, 21, 22, 23, 24, 255, 4096];
  for (const length of lengths) {
    const payload = Buffer.from(Array.from({ length }, (_, index) => index % 256));
    assert.deepEqual(wrapper.convert(payload), payload, 'convert length ' + length);
    const error = Buffer.from('e'.repeat(length));
    const result = await wrapper.resolve(-17, error, payload);
    assert.equal(result.result, -17);
    assert.equal(result.errMsg, error.toString());
    assert.equal(result.rsp, payload.toString());
    assert.deepEqual(result.rspbuffer, payload, 'resolve length ' + length);
  }
  for (const value of ['', '文🙂'.repeat(20), 12345, null, true]) {
    assert.deepEqual(wrapper.convert(value), Buffer.from(String(value)));
  }
  const responses = await Promise.all(Array.from({ length: 64 }, (_, index) => {
    const payload = Buffer.from([0, index, 255, 128]);
    return wrapper.resolve(index, Buffer.alloc(0), payload).then(result => {
      assert.equal(result.result, index);
      assert.deepEqual(result.rspbuffer, payload);
    });
  }));
  assert.equal(responses.length, 64);

  const packet = require(packetPath);
  const received = [];
  assert.equal(packet.initHook(addresses.send, addresses.recv, (...args) => received.push(args), false), 'success');
  assert.equal(wrapper.emptyPackets(), 7);
  const expected = [];
  for (const length of lengths) {
    const uin = Buffer.from('1'.repeat(length));
    const command = Buffer.from('C'.repeat(length));
    const payload = Buffer.from(Array.from({ length }, (_, index) => index % 256));
    for (const direction of [0, 1]) {
      const sequence = length + 3000;
      const result = wrapper.packet(direction, uin, command, sequence, payload);
      assert.equal(result.returned, direction === 0 ? 102 : 209);
      assert.deepEqual(result.command, command);
      expected.push([direction, direction === 0 ? '0' : uin.toString(), command.toString(), sequence, payload.toString('hex').toUpperCase()]);
    }
  }
  const embeddedNull = Buffer.from('A\0B');
  wrapper.packet(1, embeddedNull, embeddedNull, 99, Buffer.from([255, 0, 128]));
  expected.push([1, 'A\0B', 'A\0B', 99, 'FF0080']);
  packet.setO3Setting(true);
  const replaced = wrapper.packet(0, Buffer.from('1'), Buffer.from('trpc.o3.report.Report.SsoReport'), 0, Buffer.alloc(0));
  assert.equal(replaced.command.toString(), 'fuck.trpc.o3');
  packet.setO3Setting(false);
  for (let attempt = 0; received.length < expected.length && attempt < 100; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.deepEqual(received, expected);
}

if (process.argv[2] === '--probe') {
  probe(process.argv[3]).catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
} else {
  for (const mode of ['missing-wrapper', 'hooks']) {
    test('macOS ' + process.arch + ' native ' + mode, () => {
      const result = spawnSync(process.execPath, [__filename, '--probe', mode], {
        encoding: 'utf8',
        timeout: 20000,
      });
      assert.ifError(result.error);
      assert.equal(result.signal, null, result.stderr);
      assert.equal(result.status, 0, result.stderr + result.stdout);
    });
  }
}
