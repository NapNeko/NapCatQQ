import { 
    ChatType, 
    ElementType, 
    NapCatCore, 
    NTQQMsgApi, 
    NapCatOneBot11Adapter, 
    OB11Message,
    OB11BaseMessageEvent,
    OB11BaseMetaEvent
} from './dist/napcat-types/index';

console.log('--- NapCat Comprehensive Type Test ---');

// 1. 测试枚举 (Core)
console.log('ChatType.KCHATTYPEGROUP:', ChatType.KCHATTYPEGROUP); // 应输出 2
console.log('ElementType.TEXT:', ElementType.TEXT);             // 应输出 1

// 2. 测试类型 (Core)
const coreStub = {} as NapCatCore;
const apiStub = {} as NTQQMsgApi;
console.log('Core types access check: OK');

// 3. 测试类和类型 (OneBot)
const obAdapterStub = {} as NapCatOneBot11Adapter;
const obMsgStub = {} as OB11Message;
const baseMessageEventStub = {} as OB11BaseMessageEvent;
const baseMetaEventStub = {} as OB11BaseMetaEvent;
console.log('OneBot types and events access check: OK');

// 4. 验证导出完整性
if (ChatType.KCHATTYPEGROUP === 2 && ElementType.TEXT === 1) {
    console.log('\n✅ ALL TESTS PASSED: Types, Enums and Events are correctly exported and accessible.');
} else {
    console.error('\n❌ TESTS FAILED: Enum value mismatch.');
    throw new Error('Test Failed');
}


