export const onSettingWindowCreated = (view: HTMLElement) => {
    //创建iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://127.0.0.1:6099/webui?key=';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    view.appendChild(iframe);
};
