/**
 * Toast 工具模块
 * 包装 react-hot-toast，自动截断长路径避免溢出
 */
import hotToast, { ToastOptions, Renderable, ValueOrFunction, Toast } from 'react-hot-toast';
import { truncateErrorMessage } from './truncate';

type Message = ValueOrFunction<Renderable, Toast>;

/**
 * 包装后的 toast 对象
 * 对 error 类型的 toast 自动应用路径截断
 */
const toast = {
  /**
   * 显示错误 toast，自动截断长路径
   */
  error: (message: Message, options?: ToastOptions) => {
    const truncatedMessage = typeof message === 'string'
      ? truncateErrorMessage(message)
      : message;
    return hotToast.error(truncatedMessage, options);
  },

  /**
   * 显示成功 toast
   */
  success: (message: Message, options?: ToastOptions) => {
    return hotToast.success(message, options);
  },

  /**
   * 显示加载中 toast
   */
  loading: (message: Message, options?: ToastOptions) => {
    return hotToast.loading(message, options);
  },

  /**
   * 显示普通 toast
   */
  custom: hotToast.custom,

  /**
   * 关闭 toast
   */
  dismiss: hotToast.dismiss,

  /**
   * 移除 toast
   */
  remove: hotToast.remove,

  /**
   * Promise toast
   */
  promise: hotToast.promise,
};

export default toast;
