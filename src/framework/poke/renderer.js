function onLoad() {
    document.getElementsByClassName("avatar").forEach(e => e.addEventListener("contextmenu", (ee) => {
        let messageEle = ee.target.parentElement.parentElement.parentElement.parentElement;
        let messageId = messageEle.getAttribute("id");
        let groupName = document.getElementsByClassName("chat-header__contact-name")[0].firstElementChild.textContent.trim();
        // todo: 右键菜单添加戳一戳
        window.napcat.groupPoke(groupName, messageId);
    }));
}

onLoad();
