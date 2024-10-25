import crypto from 'crypto';
import assert from 'assert';
import { Sha1Stream } from './sha1Stream';

function testSha1Stream() {
    for (let i = 0; i < 100000; i++) {
        const randomLength = Math.floor(Math.random() * 1024);
        const randomData = crypto.randomBytes(randomLength);
        const sha1Stream = new Sha1Stream();
        sha1Stream.update(randomData);
        const hash = sha1Stream.final();
        const expectedDigest = crypto.createHash('sha1').update(randomData).digest();
        assert.strictEqual(hash.toString('hex'), expectedDigest.toString('hex'));
        console.log(`Test ${i + 1}: Passed`);
    }
    console.log('All tests passed successfully.');
}

testSha1Stream();
