// 日志装饰器
function log2(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with args: ${JSON.stringify(args)}`);
    const result = originalMethod.apply(this, args);
    console.log(`${propertyKey} returned: ${result}`);
    return result;
  };

  return descriptor;
}

// 示例类
class MathOperations2 {
  @log2
  add(a: number, b: number): number {
    return a + b;
  }

  @log2
  multiply(a: number, b: number): number {
    return a * b;
  }
}

// 创建实例并调用方法
const math2 = new MathOperations2();
math2.add(1, 2);  // 调用加法
math2.multiply(3, 4);  // 调用乘法