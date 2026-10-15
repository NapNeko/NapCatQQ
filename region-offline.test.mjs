import assert from 'node:assert/strict';
import { selectProfileRegion as select, profileRegionArea as area } from './packages/napcat-core/helper/profile-region.ts';
assert.equal(area({country:'中国',province:'广东',city:'广州'}),'中国 广东 广州');
assert.equal(area({country:'',province:'',city:''}),'');
assert.equal(area({province:'北京',city:'北京'}),'北京');
assert.deepEqual(select({city:'广州'},{country:'旧国家',province:'旧省'}),{country:'',province:'',city:'广州'});
assert.equal(area(select({}, {country:'中国',city:'广州'})),'中国 广州');
console.log('PASS: 5 offline region cases; no QQ requests');
