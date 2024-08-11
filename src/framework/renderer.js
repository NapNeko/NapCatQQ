export const onSettingWindowCreated = async (view) => {
    view.style.width = "100%";
    view.style.height = "100%";
    //添加iframe
    const iframe = document.createElement("iframe");
    iframe.src = await window.napcat.getWebUiUrl();
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.style.border = "none";
    //去掉iframe滚动条
    iframe.scrolling = "no";
    view.appendChild(iframe);
};