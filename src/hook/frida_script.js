const moduleName = 'wrapper.node';
const offset = 0x18152AFE0;  // 静态地址偏移

// 查找模块基地址
const baseAddress = Module.findBaseAddress(moduleName);
if (!baseAddress) {
  throw new Error('Module not found.');
}

// 计算绝对地址
const absoluteAddress = baseAddress.add(offset);

// 设置拦截器
Interceptor.attach(absoluteAddress, {
  onEnter: function(args) {
    console.log(`[+] Function at offset ${offset} in wrapper.node was called`);
    console.log('Argument 0:', args[0].toInt32());
  },
  onLeave: function(retval) {
    console.log('Return value:', retval.toInt32());
    // 可以在这里修改返回值
    retval.replace(42);
  }
});
