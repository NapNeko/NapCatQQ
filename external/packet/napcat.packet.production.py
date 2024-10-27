import asyncio #line:1
import datetime #line:2
import json #line:3
import hashlib #line:4
import sys #line:5
import websockets #line:6
import frida #line:7
clients ={}#line:9
event_loop =None #line:10
def generate_md5_hash (O000OO00OOO00O0OO :str )->str :#line:12
    return hashlib .md5 (O000OO00OOO00O0OO .encode ()).hexdigest ()#line:13
async def on_message (O000O0000OO0O0000 ,O0O00OO0OOOO000O0 ):#line:15
    try :#line:16
        if O000O0000OO0O0000 ['type']=='send':#line:17
            O000O0O00OO0O0OOO =O000O0000OO0O0000 ['payload']#line:18
            if not O0O00OO0OOOO000O0 :#line:19
                return #line:20
            if O000O0O00OO0O0OOO ['type']=='recv':#line:21
                await O0O00OO0OOOO000O0 .send (json .dumps ({"type":"recv","trace_id_md5":O000O0O00OO0O0OOO ['trace_id_md5'],"data":{"seq":O000O0O00OO0O0OOO ['seq'],"cmd":O000O0O00OO0O0OOO ['cmd'],"hex_data":O000O0O00OO0O0OOO ['hex_data']}}))#line:30
            elif O000O0O00OO0O0OOO ['type']=='send':#line:31
                print ("send data: ",O000O0O00OO0O0OOO )#line:32
                await O0O00OO0OOOO000O0 .send (json .dumps ({"type":"send","trace_id_md5":O000O0O00OO0O0OOO ['trace_id_md5'],"data":{}}))#line:37
    except Exception as O0O00O0O00O00OO0O :#line:38
        print (f"Error in on_message: {O0O00O0O00O00OO0O}")#line:39
        print (O000O0000OO0O0000 ['payload'])#line:40
def on_frida_message (OO0O00OOO00000OOO ,OOOOOO0OOO0OOO00O ,O0OO000OOOO00O000 ,O00O000OOO000O0O0 ):#line:42
    asyncio .run_coroutine_threadsafe (on_message (OO0O00OOO00000OOO ,O0OO000OOOO00O000 ),O00O000OOO000O0O0 )#line:43
async def initialize_frida (OO000OOO000O0OO00 ,O00OOOO0O0OOOO000 ):#line:45
    global clients ,event_loop #line:46
    O0O0OOOO00O000O00 =int (OO000OOO000O0OO00 ['pid'])#line:47
    O00OOO0O000O0OOO0 =hex (int (OO000OOO000O0OO00 ['recv'],16 )>>1 )#line:48
    O0O000OO0O0OOOO00 =hex (int (OO000OOO000O0OO00 ['send'],16 )>>1 )#line:49
    print ("init frida with pid: %d"%O0O0OOOO00O000O00 )#line:50
    OO0OOO0OOOO000O00 =frida .attach (O0O0OOOO00O000O00 )#line:51
    O0OOOOOOO0OO00O00 ="""
    const _0x171b=['attach','toString','add','now','recv','event\x20add!','charCodeAt','readPointer','log','set','send','length','startsWith','push','wrapper.node','event\x20send!\x20','findBaseAddress','join','delete','stringify','current_time','sended','seq','readUtf8String','event\x20clear!\x20','trace_id','hook_send\x20napcat!\x20','input','readByteArray'];const _0x5b84=function(_0x171b04,_0x5b84f0){_0x171b04=_0x171b04-0x0;let _0x379e29=_0x171b[_0x171b04];return _0x379e29;};let offset_recv=FRIDA_RECV_OFFSET;let offset_send=FRIDA_SEND_OFFSET;let eventlist=new Map();let isListened=!![];recv(_0x5b84('0x1b'),_0x443b1a=>{isListened=![];if(_0x443b1a&&_0x443b1a[_0x5b84('0x19')]){_0x443b1a['sended']=![];console[_0x5b84('0x8')](_0x5b84('0x5'),JSON['stringify'](_0x443b1a,null,0x2));eventlist[_0x5b84('0x9')](_0x443b1a[_0x5b84('0x19')],_0x443b1a);send({'type':_0x5b84('0xa'),'trace_id_md5':_0x443b1a['trace_id_md5']});}let _0x53dd5f=Date[_0x5b84('0x3')]()/0x3e8;for(let [_0x5981c6,_0x5a5f37]of eventlist){if(_0x5a5f37[_0x5b84('0x14')]+0x3c<_0x53dd5f){console['log'](_0x5b84('0x18'),JSON['stringify'](_0x5a5f37,null,0x2));eventlist[_0x5b84('0x12')](_0x5981c6);}}});function bytesToHex(_0x317040){var _0x475d58=new Uint8Array(_0x317040);for(var _0x247ab6=[],_0x4f61a3=0x0;_0x4f61a3<_0x475d58[_0x5b84('0xb')];_0x4f61a3++){_0x247ab6[_0x5b84('0xd')]((_0x475d58[_0x4f61a3]>>>0x4)['toString'](0x10));_0x247ab6['push']((_0x475d58[_0x4f61a3]&0xf)[_0x5b84('0x1')](0x10));}return _0x247ab6[_0x5b84('0x11')]('');}function HexToBytes(_0x4a226e){var _0x335e51=[];for(var _0x46bc7a=0x0;_0x46bc7a<_0x4a226e['length'];_0x46bc7a+=0x2)_0x335e51[_0x5b84('0xd')](parseInt(_0x4a226e['substr'](_0x46bc7a,0x2),0x10));return _0x335e51;}function String2HexText(_0xba6082){var _0x20ceff=[];for(var _0x28780a=0x0;_0x28780a<_0xba6082['length'];_0x28780a++){_0x20ceff[_0x28780a]=_0xba6082[_0x5b84('0x6')](_0x28780a)['toString'](0x10);}return _0x20ceff[_0x5b84('0x11')]('');}async function main(){let _0x112236=Module[_0x5b84('0x10')]('wrapper.node');while(_0x112236==null){_0x112236=Module[_0x5b84('0x10')](_0x5b84('0xe'));}let _0xce97d=_0x112236['add'](offset_recv);console['log']('hook_recv\x20napcat!\x20');Interceptor[_0x5b84('0x0')](_0xce97d,{'onEnter'(_0x58d330){let _0x366bab=Memory['readPointer'](_0x58d330[0x1])['add'](0x20);let _0x4fc7ff=new Uint8Array(_0x366bab['readByteArray'](0x1))[0x0]&0x1;let _0x28a912=Memory['readPointer'](_0x58d330[0x1])['add'](0x18);let _0x13dd09=Memory[_0x5b84('0x7')](_0x58d330[0x1]);let _0x50360e=new Uint8Array(_0x13dd09[_0x5b84('0x1c')](0x1))[0x0]&0x1;let _0x196dbb=Memory['readPointer'](Memory['readPointer'](_0x58d330[0x1])[_0x5b84('0x2')](0x38));let _0x42cfc8=Memory['readPointer'](_0x196dbb);let _0xca3db8=Memory[_0x5b84('0x7')](_0x196dbb[_0x5b84('0x2')](0x8));let _0x21181a=_0xca3db8-_0x42cfc8;let _0x169a6e=_0x4fc7ff==0x0?Memory[_0x5b84('0x17')](_0x366bab['add'](0x1)):Memory['readUtf8String'](Memory[_0x5b84('0x7')](_0x366bab['add'](0x10)));let _0x3e9755=_0x50360e==0x0?Memory[_0x5b84('0x17')](_0x13dd09['add'](0x1)):Memory[_0x5b84('0x17')](Memory[_0x5b84('0x7')](_0x13dd09[_0x5b84('0x2')](0x10)));let _0x12eb97=Memory['readU32'](_0x28a912);let _0x177b45=bytesToHex(_0x42cfc8['readByteArray'](_0x21181a));let _0xb9a9db='';for(let [_0x7418bd,_0x53b726]of eventlist){if(_0x53b726[_0x5b84('0x16')]==_0x12eb97){_0xb9a9db=_0x53b726['trace_id_md5'];eventlist['delete'](_0x7418bd);break;}}send({'type':_0x5b84('0x4'),'trace_id_md5':_0xb9a9db,'seq':_0x12eb97,'hex_data':_0x177b45,'cmd':_0x169a6e});},'onLeave'(_0x18676d){}});let _0x50e030=_0x112236[_0x5b84('0x2')](offset_send);console['log'](_0x5b84('0x1a'));Interceptor[_0x5b84('0x0')](_0x50e030,{'onEnter'(_0x2c50e5){let _0x43ef68=Memory[_0x5b84('0x7')](_0x2c50e5[0x1])[_0x5b84('0x2')](0x40);let _0x11494e=Memory['readPointer'](_0x2c50e5[0x1])['add'](0x20);let _0x160870=new Uint8Array(_0x11494e['readByteArray'](0x1))[0x0]&0x1;let _0x48c8c0=Memory[_0x5b84('0x7')](Memory['readPointer'](_0x2c50e5[0x1]));let _0x551e15=new Uint8Array(_0x48c8c0['readByteArray'](0x1))[0x0]&0x1;let _0x3d1fb7=Memory[_0x5b84('0x7')](Memory['readPointer'](Memory[_0x5b84('0x7')](_0x2c50e5[0x1]))['add'](0x20));let _0x532d5f=Memory['readPointer'](_0x3d1fb7);let _0xc16bfa=Memory[_0x5b84('0x7')](_0x3d1fb7['add'](0x8));let _0x388601=_0xc16bfa-_0x532d5f;let _0x2f6658=_0x551e15==0x0?Memory['readUtf8String'](_0x48c8c0['add'](0x1)):Memory['readUtf8String'](Memory['readPointer'](_0x48c8c0['add'](0x10)));let _0xa730b0=_0x160870==0x0?Memory[_0x5b84('0x17')](_0x11494e['add'](0x1)):Memory['readUtf8String'](Memory['readPointer'](_0x11494e[_0x5b84('0x2')](0x10)));let _0xd6be27=Memory['readU32'](_0x43ef68);let _0x46ad70=bytesToHex(_0x532d5f[_0x5b84('0x1c')](_0x388601));for(let [_0xecd6b,_0x5390a3]of eventlist){if(_0x46ad70[_0x5b84('0xc')](String2HexText(_0x5390a3[_0x5b84('0x19')]))&&!_0x5390a3['sended']){_0x532d5f['writeByteArray'](HexToBytes(_0x5390a3['hex_data']));_0x5390a3[_0x5b84('0x15')]=!![];_0x5390a3[_0x5b84('0x16')]=_0xd6be27;console[_0x5b84('0x8')](_0x5b84('0xf'),JSON['stringify'](_0x5390a3,null,0x2));break;}}if(!isListened){recv(_0x5b84('0x1b'),_0x17512b=>{isListened=![];if(_0x17512b&&_0x17512b[_0x5b84('0x19')]){_0x17512b[_0x5b84('0x15')]=![];console[_0x5b84('0x8')]('event\x20add!',JSON['stringify'](_0x17512b,null,0x2));eventlist[_0x5b84('0x9')](_0x17512b['trace_id'],_0x17512b);send({'type':'send','trace_id_md5':_0x17512b['trace_id_md5']});}let _0x1e9c5e=Date[_0x5b84('0x3')]()/0x3e8;for(let [_0x1b9261,_0x44053a]of eventlist){if(_0x44053a[_0x5b84('0x14')]+0x3c<_0x1e9c5e){console['log'](_0x5b84('0x18'),JSON[_0x5b84('0x13')](_0x44053a,null,0x2));eventlist[_0x5b84('0x12')](_0x1b9261);}}});}},'onLeave'(_0xf6dcf2){}});}main()['then']();
    """#line:55
    O0OOOOOOO0OO00O00 =O0OOOOOOO0OO00O00 .replace ("FRIDA_RECV_OFFSET",O00OOO0O000O0OOO0 )#line:56
    O0OOOOOOO0OO00O00 =O0OOOOOOO0OO00O00 .replace ("FRIDA_SEND_OFFSET",O0O000OO0O0OOOO00 )#line:57
    OOO0000O00O0O0000 =OO0OOO0OOOO000O00 .create_script (O0OOOOOOO0OO00O00 )#line:58
    OOO0000O00O0O0000 .on ('message',lambda O00OO0000O0OO000O ,O0O0000OO00OO0OO0 :on_frida_message (O00OO0000O0OO000O ,O0O0000OO00OO0OO0 ,O00OOOO0O0OOOO000 ,event_loop ))#line:59
    OOO0000O00O0O0000 .load ()#line:60
    clients [O00OOOO0O0OOOO000 ]={'pid':O0O0OOOO00O000O00 ,'frida_script':OOO0000O00O0O0000 ,'session':OO0OOO0OOOO000O00 }#line:66
    await O00OOOO0O0OOOO000 .send (json .dumps ({"type":"init",'trace_id':'init',"data":{}}))#line:68
async def handle_send (OO0O00000O0000O00 ,O0O0000OOOOO00000 ):#line:70
    global clients #line:71
    OO0O00OO0OO0OOO0O =OO0O00000O0000O00 ['data']#line:72
    OOOO00000O00OOO00 =OO0O00000O0000O00 ['trace_id']#line:73
    O000O0000000O00O0 =OO0O00000O0000O00 ['cmd']#line:74
    O00OOOO0OOOOO0O0O =int (datetime .datetime .now ().timestamp ())#line:75
    O00OOO00000O000OO =clients [O0O0000OOOOO00000 ]['frida_script']#line:76
    O00OOO00000O000OO .post ({'type':'input','cmd':O000O0000000O00O0 ,'hex_data':OO0O00OO0OO0OOO0O ,'trace_id':OOOO00000O00OOO00 ,'current_time':O00OOOO0OOOOO0O0O ,'trace_id_md5':generate_md5_hash (OOOO00000O00OOO00 )})#line:84
async def websocket_handler (O000OO0OO0OO0OO0O ,OO0O0OO0O00OOOO0O ):#line:86
    global clients #line:87
    try :#line:88
        async for O0OOOOO0O00O0OO00 in O000OO0OO0OO0OO0O :#line:89
            O00O0O0O000OO0O0O =json .loads (O0OOOOO0O00O0OO00 )#line:90
            O000O0000O00OO00O =O00O0O0O000OO0O0O .get ('action')#line:91
            if O000O0000O00OO00O =='init':#line:92
                O0OO0000OOOOO000O =False #line:93
                for OO00OO000O00O0OOO in frida .get_local_device ().enumerate_processes ():#line:94
                    if OO00OO000O00O0OOO .pid ==clients .get (O000OO0OO0OO0OO0O ,{}).get ('pid'):#line:95
                        O0OO0000OOOOO000O =True #line:96
                if not O0OO0000OOOOO000O :#line:97
                    await initialize_frida (O00O0O0O000OO0O0O ,O000OO0OO0OO0OO0O )#line:98
            elif O000O0000O00OO00O =='send'and O000OO0OO0OO0OO0O in clients :#line:99
                await handle_send (O00O0O0O000OO0O0O ,O000OO0OO0OO0OO0O )#line:100
    except Exception as O0OOOO0O00O000O0O :#line:101
        print (f"WebSocket connection closed: {O0OOOO0O00O000O0O}")#line:102
    finally :#line:103
        if O000OO0OO0OO0OO0O in clients :#line:104
            clients [O000OO0OO0OO0OO0O ]['session'].detach ()#line:105
            del clients [O000OO0OO0OO0OO0O ]#line:106
async def main ():#line:108
    global event_loop #line:109
    event_loop =asyncio .get_running_loop ()#line:110
    OOOOOO0OOO0000O0O =None #line:111
    OOO000OO0O0OOOO00 =None #line:112
    if '-ip'in sys .argv and '-port'in sys .argv :#line:114
        O00000OOO00OO000O =sys .argv .index ('-ip')+1 #line:115
        OOO0O00O0OO0000OO =sys .argv .index ('-port')+1 #line:116
        if O00000OOO00OO000O <len (sys .argv )and OOO0O00O0OO0000OO <len (sys .argv ):#line:117
            OOOOOO0OOO0000O0O =sys .argv [O00000OOO00OO000O ]#line:118
            OOO000OO0O0OOOO00 =int (sys .argv [OOO0O00O0OO0000OO ])#line:119
    if OOOOOO0OOO0000O0O is None or OOO000OO0O0OOOO00 is None :#line:121
        O0OOOOOO0OO0O0OO0 =read_config ()#line:122
        OOOOOO0OOO0000O0O =O0OOOOOO0OO0O0OO0 ['ip']#line:123
        OOO000OO0O0OOOO00 =O0OOOOOO0OO0O0OO0 ['port']#line:124
    print ("listen...",OOOOOO0OOO0000O0O ,OOO000OO0O0OOOO00 )#line:126
    async with websockets .serve (websocket_handler ,OOOOOO0OOO0000O0O ,OOO000OO0O0OOOO00 ):#line:127
        await asyncio .get_running_loop ().create_future ()#line:128
def read_config ():#line:130
    try :#line:131
        with open ("config.json","r")as OO0O0O00OOOOO0OO0 :#line:132
            O0O00O0OO00O00000 =json .load (OO0O0O00OOOOO0OO0 )#line:133
    except FileNotFoundError :#line:134
        O0O00O0OO00O00000 ={"ip":"127.0.0.1","port":8086 }#line:135
        with open ("config.json","w")as OO0O0O00OOOOO0OO0 :#line:136
            OO0O0O00OOOOO0OO0 .write (json .dumps (O0O00O0OO00O00000 ))#line:137
    return O0O00O0OO00O00000 #line:138
if __name__ =='__main__':#line:140
    asyncio .run (main ())