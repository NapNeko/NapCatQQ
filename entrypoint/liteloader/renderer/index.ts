export const onSettingWindowCreated = (view: HTMLElement) => {
    //设置父元素100%
    view.style.height = '100%';
    view.style.width = '100%';
    //创建iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'http://127.0.0.1:6099/webui/';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    //调整滚动条为小滚动条 渐变色 圆角
    iframe.style.scrollbarWidth = 'thin';
    iframe.style.scrollbarColor = 'rgba(0,0,0,0.1) rgba(0,0,0,0.05)';
    view.appendChild(iframe);
};
