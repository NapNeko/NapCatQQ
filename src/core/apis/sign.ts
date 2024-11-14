import { InstanceContext, NapCatCore } from '..';

export class NTQQMusicSignApi {
    context: InstanceContext;
    core: NapCatCore;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
    }
    //转换外域名为 https://qq.ugcimg.cn/v1/cpqcbu4b8870i61bde6k7cbmjgejq8mr3in82qir4qi7ielffv5slv8ck8g42novtmev26i233ujtuab6tvu2l2sjgtupfr389191v00s1j5oh5325j5eqi40774jv1i/khovifoh7jrqd6eahoiv7koh8o
    //https://cgi.connect.qq.com/qqconnectopen/openapi/change_image_url?url=https://th.bing.com/th?id=OSK.b8ed36f1fb1889de6dc84fd81c187773&w=46&h=46&c=11&rs=1&qlt=80&o=6&dpr=2&pid=SANGAM

    //外域名不行得走qgroup中转
    //https://proxy.gtimg.cn/tx_tls_gate=y.qq.com/music/photo_new/T002R800x800M000000y5gq7449K9I.jpg

    //可外域名
    //https://pic.ugcimg.cn/500955bdd6657ecc8e82e02d2df06800/jpg1

    //QQ音乐gtimg接口
    //https://y.gtimg.cn/music/photo_new/T002R800x800M000000y5gq7449K9I.jpg?max_age=2592000

    //还有一处公告上传可以上传高质量图片 持久为qq域名
}

