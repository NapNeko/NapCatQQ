# 自动注册路由测试

## 参与工具
vite-auto-include           自动化收集所有文件并引入
@vitejs/plugin-react-swc    包含对装饰器的支持

## 支持示例
```typescript
@ActionHandler
export default class TestAutoRegister02 extends OneBotAction<void, string> {
  override actionName = ActionName.TestAutoRegister02;

  async _handle (_payload: void): Promise<string> {
    return 'AutoRegister Router Test';
  }
}
```