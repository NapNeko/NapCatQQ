export function injectPokeMenu() {

    console.log('Inject poke menu...');

    // 选择目标节点
    const targetNode = document.body;
    console.log(targetNode);
    // 配置需要观察的变动类型
    const config = {
        childList: true,      // 观察子节点的变动
        subtree: true         // 观察后代节点
    };

    // 创建一个回调函数，当变动发生时执行
    const callback = function(mutationsList, observer) {
        // console.log(mutationsList);
        for (const mutation of mutationsList) {
            // console.log(mutation.addedNodes);
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node?.previousSibling?.classList?.contains('q-context-menu')){
                        const r = node.previousSibling.getBoundingClientRect();
                        const rightClickEle = document.elementFromPoint(r.x, r.y);
                        console.log("右击的元素", rightClickEle);
                        if (rightClickEle.classList?.contains('avatar')){
                            node.previousSibling.insertAdjacentHTML('beforeend', '<a class="q-context-menu-item q-context-menu-item-normal poke-menu"><span class="q-context-menu-item__text">戳一戳</span></a>');
                            node.previousSibling.querySelector('.poke-menu').addEventListener('click', e=>{
                                let messageEle = rightClickEle.parentElement.parentElement.parentElement.parentElement;
                                let messageId = messageEle.id;
                                const groupName = document.getElementsByClassName("chat-header__contact-name")[0].firstElementChild.textContent.trim();
                                window.napcat.groupPoke(groupName, messageId);
                            });

                        }
                    }
                });
            }
        }
    };

    // 创建一个新的观察者实例并传入回调函数
    const observer = new MutationObserver(callback);

    // 开始观察目标节点并传入配置
    observer.observe(targetNode, config);
}


