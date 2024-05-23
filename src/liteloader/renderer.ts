async function onSettingWindowCreated(view: Element) {
    const iframe = document.createElement('iframe');
    iframe.src = 'http://127.0.0.1:6099/webui/'; //应该从 preload->main 那里获取
    iframe.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;';
    view.appendChild(iframe);
}
async function isRendererInit() {

}

if (location.hash === '#/blank') {
    (window as any).navigation.addEventListener('navigatesuccess', isRendererInit, { once: true });
} else {
    isRendererInit();
}
export {
    onSettingWindowCreated
};
