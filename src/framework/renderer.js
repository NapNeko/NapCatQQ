export const onSettingWindowCreated = async (view) => {
    let webui = await window.napcat.getWebUiUrl();
    view.innerHTML = `
    <setting-section data-title="">
    <setting-panel>
        <setting-list data-direction="column">
            <setting-item>
                <setting-button data-type="primary" class="nc_openwebui">在QQ内打开配置页面</setting-button>
                <setting-button data-type="primary" class="nc_openwebui_ex">在默认浏览器打开配置页面</setting-button>
            </setting-item>
                <setting-item>
                <div>
                    <setting-text>WebUi远程地址可以点击下方复制哦~</setting-text>
                    <setting-text class="nc_webui">WebUi</setting-text>
                </div>
            </setting-item>
        </setting-list>
    </setting-panel>
</setting-section>
    `;

    view.querySelector('.nc_openwebui').addEventListener('click', () => {
        window.napcat.openInnerUrl(webui);
    });
    view.querySelector('.nc_openwebui_ex').addEventListener('click', () => {
        window.napcat.openExternalUrl(webui);
    });

    view.querySelector('.nc_webui').innerText = webui;

    // 添加点击复制功能
    view.querySelector('.nc_webui').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(webui);
            alert('WebUi URL 已复制到剪贴板');
        } catch (err) {
            console.error('复制到剪贴板失败: ', err);
        }
    });
};