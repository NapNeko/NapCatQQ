type BrowserWindow = any;
function onBrowserWindowCreated(window: BrowserWindow) {

}
async function loadNapCat() {
    
}

try {
    loadNapCat();
} catch {
    console.log("loadNapCat error");
}
export {
    onBrowserWindowCreated
};

