import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Value } from '@sinclair/typebox/value';
import { OB11MessageDataSchema, OB11MessageSchema, OB11PostSendMsgSchema } from './types/message';
import { OB11MessageSchema as OB11ActionMessageSchema } from './action/schemas';

try {
  TypeCompiler.Compile(OB11MessageDataSchema);
  console.log("Compile OB11MessageDataSchema OK");
} catch (e: any) {
  console.error("Error in OB11MessageDataSchema:", e.message);
}

try {
  TypeCompiler.Compile(OB11MessageSchema);
  console.log("Compile OB11MessageSchema OK");
} catch (e: any) {
  console.error("Error in OB11MessageSchema:", e.message);
}

try {
  TypeCompiler.Compile(OB11ActionMessageSchema);
  console.log("Compile OB11ActionMessageSchema OK");
} catch (e: any) {
  console.error("Error in OB11ActionMessageSchema:", e.message);
}

import { Type } from '@sinclair/typebox';
try {
  const QA = Type.Object({ message: OB11PostSendMsgSchema, quick_action: OB11ActionMessageSchema });
  TypeCompiler.Compile(QA);
  console.log("Compile Quick Action OK");
} catch (e: any) {
  console.error("Error in Quick Action:", e.message);
}

// Test validation
const testObj = {
  message_type: 'private',
  user_id: 12345,
  message: [
    { type: 'text', data: { text: 'hello' } }
  ]
};

try {
  let data = structuredClone(testObj);
  data = Value.Default(OB11PostSendMsgSchema, data) as any;
  data = Value.Convert(OB11PostSendMsgSchema, data) as any;

  const compiler = TypeCompiler.Compile(OB11PostSendMsgSchema);
  const isValid = compiler.Check(data);
  console.log("Validation result:", isValid);
  if (!isValid) {
    const errors = [...compiler.Errors(data)];
    errors.forEach(e => console.error(e.path, e.message));
  } else {
    console.log("Data after Convert and Check:", JSON.stringify(data, null, 2));
  }
} catch (e: any) {
  console.error("Test validation error:", e.message);
}
