import express from 'express';
import { resolve } from 'node:path';
const app = express()
export async function InitWebUi() {
    app.use(express.json())
    app.use('/webui', express.static(resolve(__dirname, './static')))
    // 启动WebUi
    app.listen(6099, async () => {
        console.log(`WebUi is running at IP:6099`)
    })

}
