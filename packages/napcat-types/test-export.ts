import { ChatType, ElementType, NapCatCore, NTQQMsgApi } from './index';

console.log('--- NapCat Types Manual Test ---');

// 测试枚举值 (napcat-core enums)
console.log('ChatType.KCHATTYPEGROUP:', ChatType.KCHATTYPEGROUP);
console.log('ElementType.TEXT:', ElementType.TEXT);

// 测试 napcat-core 的类型和类
const coreStub = {} as NapCatCore;
const apiStub = {} as NTQQMsgApi;

console.log('NapCatCore type check:', !!coreStub);
console.log('NTQQMsgApi type check:', !!apiStub);

if (ChatType.KCHATTYPEGROUP === 2 && ElementType.TEXT === 1) {
  console.log('Test Passed: core enums and types are correctly exported.');
} else {
  throw new Error('Test Failed: Enum values do not match expected values.');
}
