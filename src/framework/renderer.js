
export const onSettingWindowCreated = async (view) => {

    // view.style.width = "100%";
    // view.style.height = "100%";
    // //添加iframe
    // const iframe = document.createElement("iframe");
    // iframe.src = await window.napcat.getWebUiUrl();
    // iframe.width = "100%";
    // iframe.height = "100%";
    // iframe.style.border = "none";
    // //去掉iframe滚动条
    // //iframe.scrolling = "no";
    // //有滚动条何尝不是一种美
    // view.appendChild(iframe);
    let webui = await window.napcat.getWebUiUrl()
    let panel = `
    <setting-section data-title="">
    <setting-panel>
        <setting-list data-direction="column">
            <setting-item>
                <setting-button data-type="primary" class="nc_openwebui">打开配置页面</setting-button>
            </setting-item>
                <setting-item>
                <div>
                    <setting-text class="nc_webui">WebUi</setting-text>
                </div>
            </setting-item>
        </setting-list>
    </setting-panel>
</setting-section>
    `;
    view.innerHTML = panel;
    view.querySelector(".nc_openwebui").addEventListener("click", () => {
        window.open(webui, "_blank");
    });
    view.querySelector(".nc_webui").innerText = webui;
};