import { RequestUtil } from '@/common/utils/request';
import { MiniAppLuaJsonType } from '@/core';
import { InstanceContext, NapCatCore } from '..';

// let t = await napCatCore.session.getGroupService().shareDigest({
//   appId: "100497308",
//   appType: 1,
//   msgStyle: 0,
//   recvUin: "726067488",
//   sendType: 1,
//   clientInfo: {
//     platform: 1
//   },
//   richMsg: {
//     usingArk: true,
//     title: "Bot测试title",
//     summary:  "Bot测试summary",
//     url: "https://www.bilibili.com",
//     pictureUrl: "https://y.qq.com/music/photo_new/T002R300x300M0000035DC6W4ZpSqf_1.jpg?max_age=2592000",
//     brief:  "Bot测试brief",
//   }
// });
// {
//   errCode: 0,
//   errMsg: '',
//   rsp: {
//     sendType: 1,
//     recvUin: '726067488',
//     recvOpenId: '',
//     errCode: 901501,
//     errMsg: 'imagent service_error:150_OIDB_NO_PRIV',
//     extInfo: {
//       wording: '消息下发失败(错误码：901501)',
//       jumpResult: 0,
//       jumpUrl: '',
//       level: 0,
//       subLevel: 0,
//       developMsg: 'imagent error'
//     }
//   }
// }

// export class MusicSign {
//   private readonly url: string;

//   constructor(url: string) {
//     this.url = url;
//   }

//   sign(postData: CustomMusicSignPostData | IdMusicSignPostData): Promise<any> {
//     return new Promise((resolve, reject) => {
//       fetch(this.url, {
//         method: 'POST', // 指定请求方法为 POST
//         headers: {
//           'Content-Type': 'application/json' // 设置请求头，指明发送的数据类型为 JSON
//         },
//         body: JSON.stringify(postData) // 将 JavaScript 对象转换为 JSON 字符串作为请求体
//       })
//         .then(response => {
//           if (!response.ok) {
//             reject(response.statusText); // 请求失败，返回错误信息
//           }
//           return response.json(); // 解析 JSON 格式的响应体
//         })
//         .then(data => {
//           logDebug('音乐消息生成成功', data);
//           resolve(data);
//         })
//         .catch(error => {
//           reject(error);
//         });
//     });
//   }
// }

export class NTQQMusicSignApi {
    context: InstanceContext;
    core: NapCatCore;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
    }

    async signMiniApp(CardData: MiniAppLuaJsonType) {
        // {
        //   "app": "com.tencent.miniapp.lua",
        //   "bizsrc": "tianxuan.imgJumpArk",
        //   "view": "miniapp",
        //   "prompt": "hi! 这里有我的日常故事，只想讲给你听",
        //   "config": {
        //     "type": "normal",
        //     "forward": 1,
        //     "autosize": 0
        //   },
        //   "meta": {
        //     "miniapp": {
        //       "title": "hi! 这里有我的日常故事，只想讲给你听",
        //       "preview": "https:\/\/tianquan.gtimg.cn\/qqAIAgent\/item\/7\/square.png",
        //       "jumpUrl": "https:\/\/club.vip.qq.com\/transfer?open_kuikly_info=%7B%22version%22%3A%20%221%22%2C%22src_type%22%3A%20%22web%22%2C%22kr_turbo_display%22%3A%20%221%22%2C%22page_name%22%3A%20%22vas_ai_persona_moments%22%2C%22bundle_name%22%3A%20%22vas_ai_persona_moments%22%7D&page_name=vas_ai_persona_moments&enteranceId=share&robot_uin=3889008584",
        //       "tag": "QQ智能体",
        //       "tagIcon": "https:\/\/tianquan.gtimg.cn\/shoal\/qqAIAgent\/3e9d70c9-d98c-45b8-80b4-79d82971b514.png",
        //       "source": "QQ智能体",
        //       "sourcelogo": "https:\/\/tianquan.gtimg.cn\/shoal\/qqAIAgent\/3e9d70c9-d98c-45b8-80b4-79d82971b514.png"
        //     }
        //   }
        // }

        // token : function(url,skey){
        //   var str = skey || cookie('skey') || cookie('rv2') || '',
        //     hash = 5381;
        //   if(url){
        //     var hostname = uri(url).hostname;
        //     if(hostname.indexOf('qun.qq.com') > -1 || (hostname.indexOf('qzone.qq.com') > -1 && hostname.indexOf('qun.qzone.qq.com') === -1)){
        //       str = cookie('p_skey') || str;
        //     }
        //   }
        //   for(var i = 0, len = str.length; i < len; ++i){
        //     hash += (hash << 5) + str.charAt(i).charCodeAt();
        //   }
        //   return hash & 0x7fffffff;
        // },
        // 

        // function signToken(skey: string) {
        //   let hash = 5381;
        //   for (let i = 0, len = skey.length; i < len; ++i) {
        //     hash += (hash << 5) + skey.charCodeAt(i);
        //   }
        //   return hash & 0x7fffffff;
        // }
        const signCard = {
            'app': 'com.tencent.miniapp.lua',
            'bizsrc': 'tianxuan.imgJumpArk',
            'view': 'miniapp',
            'prompt': CardData.prompt,
            'config': {
                'type': 'normal',
                'forward': 1,
                'autosize': 0,
            },
            'meta': {
                'miniapp': {
                    'title': CardData.title,
                    'preview': (CardData.preview as string).replace(/\\/g, '\\/\\/'),
                    'jumpUrl': (CardData.jumpUrl as string).replace(/\\/g, '\\/\\/'),
                    'tag': CardData.tag,
                    'tagIcon': (CardData.tagIcon as string).replace(/\\/g, '\\/\\/'),
                    'source': CardData.source,
                    'sourcelogo': (CardData.sourcelogo as string).replace(/\\/g, '\\/\\/'),
                },
            },
        };
        // let signCard = {
        //   "app": "com.tencent.eventshare.lua",
        //   "prompt": "Bot Test",
        //   "bizsrc": "tianxuan.business",
        //   "meta": {
        //     "eventshare": {
        //       "button1URL": "https://www.bilibili.com",
        //       "button1disable": false,
        //       "button1title": "点我前往",
        //       "button2URL": "",
        //       "button2disable": false,
        //       "button2title": "",
        //       "buttonNum": 1,
        //       "jumpURL": "https://www.bilibili.com",
        //       "preview": "https://tianquan.gtimg.cn/shoal/card/9930bc4e-4a92-4da3-814f-8094a2421d9c.png",
        //       "tag": "QQ集卡",
        //       "tagIcon": "https://tianquan.gtimg.cn/shoal/card/c034854b-102d-40be-a545-5ca90a7c49c9.png",
        //       "title": "Bot Test"
        //     }
        //   },
        //   "config": {
        //     "autosize": 0,
        //     "collect": 0,
        //     "ctime": 1716568575,
        //     "forward": 1,
        //     "height": 336,
        //     "reply": 0,
        //     "round": 1,
        //     "type": "normal",
        //     "width": 263
        //   },
        //   "view": "eventshare",
        //   "ver": "0.0.0.1"
        // };
        const data = (await this.core.getApiContext().UserApi.getQzoneCookies());
        const Bkn = this.core.getApiContext().WebApi.getBknFromCookie(data.p_skey);

        const CookieValue = 'p_skey=' + data.p_skey + '; skey=' + data.skey + '; p_uin=o' + this.core.selfInfo.uin + '; uin=o' + this.core.selfInfo.uin;

        const signurl = 'https://h5.qzone.qq.com/v2/vip/tx/trpc/ark-share/GenNewSignedArk?g_tk=' + Bkn + '&ark=' + encodeURIComponent(JSON.stringify(signCard));
        let signed_ark = '';
        try {
            const retData = await RequestUtil.HttpGetJson<{
                code: number,
                data: { signed_ark: string }
            }>(signurl, 'GET', undefined, { Cookie: CookieValue });
            //logDebug('MiniApp JSON 消息生成成功', retData);
            signed_ark = retData.data.signed_ark;
        } catch (error) {
            this.context.logger.logDebug('MiniApp JSON 消息生成失败', error);
        }
        return signed_ark;
    }

    async signInternal(songname: string, singer: string, cover: string, songmid: string, songmusic: string) {
        //curl -X POST 'https://mqq.reader.qq.com/api/mqq/share/card?accessToken&_csrfToken&source=c0003' -H 'Content-Type: application/json' -H 'Cookie: uin=o10086' -d '{"app":"com.tencent.qqreader.share","config":{"ctime":1718634110,"forward":1,"token":"9a63343c32d5a16bcde653eb97faa25d","type":"normal"},"extra":{"app_type":1,"appid":100497308,"msg_seq":14386738075403815000.0,"uin":1733139081},"meta":{"music":{"action":"","android_pkg_name":"","app_type":1,"appid":100497308,"ctime":1718634110,"desc":"周杰伦","jumpUrl":"https://i.y.qq.com/v8/playsong.html?songmid=0039MnYb0qxYhV&type=0","musicUrl":"http://ws.stream.qqmusic.qq.com/http://isure6.stream.qqmusic.qq.com/M800002202B43Cq4V4.mp3?fromtag=810033622&guid=br_xzg&trace=23fe7bcbe2336bbf&uin=553&vkey=CF0F5CE8B0FA16F3001F8A88D877A217EB5E4F00BDCEF1021EB6C48969CA33C6303987AEECE9CC840122DD2F917A59D6130D8A8CA4577C87","preview":"https://y.qq.com/music/photo_new/T002R800x800M000000MkMni19ClKG.jpg","cover":"https://y.qq.com/music/photo_new/T002R800x800M000000MkMni19ClKG.jpg","sourceMsgId":"0","source_icon":"https://p.qpic.cn/qqconnect/0/app_100497308_1626060999/100?max-age=2592000&t=0","source_url":"","tag":"QQ音乐","title":"晴天","uin":10086}},"prompt":"[分享]晴天","ver":"0.0.0.1","view":"music"}'
        const signurl = 'https://mqq.reader.qq.com/api/mqq/share/card?accessToken&_csrfToken&source=c0003';
        //let  = "https://y.qq.com/music/photo_new/T002R800x800M000000MkMni19ClKG.jpg";
        const signCard = {
            app: 'com.tencent.qqreader.share',
            config: {
                ctime: 1718634110,
                forward: 1,
                token: '9a63343c32d5a16bcde653eb97faa25d',
                type: 'normal',
            },
            extra: {
                app_type: 1,
                appid: 100497308,
                msg_seq: 14386738075403815000,
                uin: 1733139081,
            },
            meta: {
                music: {
                    action: '',
                    android_pkg_name: '',
                    app_type: 1,
                    appid: 100497308,
                    ctime: 1718634110,
                    desc: singer,
                    jumpUrl: 'https://i.y.qq.com/v8/playsong.html?songmid=' + songmid + '&type=0',
                    musicUrl: songmusic,
                    preview: cover,
                    cover: cover,
                    sourceMsgId: '0',
                    source_icon: 'https://p.qpic.cn/qqconnect/0/app_100497308_1626060999/100?max-age=2592000&t=0',
                    source_url: '',
                    tag: 'QQ音乐',
                    title: songname,
                    uin: 10086,
                },
            },
            prompt: '[分享]' + songname,
            ver: '0.0.0.1',
            view: 'music',
        };
        //console.log(JSON.stringify(signCard, null, 2));
        const data = await RequestUtil.HttpGetJson<{ code: number, data: { arkResult: string } }>
        (signurl, 'POST', signCard, { 'Cookie': 'uin=o10086', 'Content-Type': 'application/json' });
        return data;
    }

    //注意处理错误
    async signWay03(id: string = '', mid: string = '') {
        let signedMid;
        if (mid == '') {
            const MusicInfo = await RequestUtil.HttpGetJson<{
                songinfo?: {
                    data?: {
                        track_info: {
                            mid: string
                        }
                    }
                }
            }>(
                'https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0&data={"comm":{"ct":24,"cv":0},"songinfo":{"method":"get_song_detail_yqq","param":{"song_type":0,"song_mid":"","song_id":' + id + '},"module":"music.pf_song_detail_svr"}}',
                'GET',
                undefined,
            );
            signedMid = MusicInfo.songinfo?.data?.track_info.mid;
        }
        //第三方接口 存在速率限制 现在勉强用
        const MusicReal = await RequestUtil.HttpGetJson<{
            code: number,
            data?: {
                name: string,
                singer: string,
                url: string,
                cover: string
            }
        }>('https://api.leafone.cn/api/qqmusic?id=' + signedMid + '&type=8', 'GET');
        //console.log(MusicReal);
        return { ...MusicReal.data, mid: signedMid };
    }

    async CreateMusicThirdWay1(id: string = '', mid: string = '') {

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
    async SignMusicWrapper(id: string = '') {
        const MusicInfo = await this.signWay03(id)!;
        return await this.signInternal(MusicInfo.name!, MusicInfo.singer!, MusicInfo.cover!, MusicInfo.mid!, 'https://ws.stream.qqmusic.qq.com/' + MusicInfo.url!);
    }

}

