import { Response } from 'express';
import { OB11Response } from '../action/OB11Response';
import { HttpServerBase } from '@/common/server/http';
import { actionHandlers, actionMap } from '../action';
import { ob11Config } from '@/onebot11/config';
import { selfInfo } from '@/core/data';
import { OB11HeartbeatEvent } from '@/onebot11/event/meta/OB11HeartbeatEvent';
import { postOB11Event } from '@/onebot11/server/postOB11Event';
import { napCatCore } from '@/core';

class OB11HTTPServer extends HttpServerBase {
  name = 'OneBot V11 server';

  handleFailed(res: Response, payload: any, e: any) {
    res.send(OB11Response.error(e.stack.toString(), 200));
  }

  protected listen(port: number, host: string) {
    if (ob11Config.enableHttp) {
      super.listen(port, host);
    }
  }
}

export const ob11HTTPServer = new OB11HTTPServer();

setTimeout(() => {
  for (const [actionName, action] of actionMap) {
    for (const method of ['post', 'get']) {
      ob11HTTPServer.registerRouter(method, actionName, (res, payload) => {
        return action.handle(payload);
      });
    }
  }
}, 0);


class HTTPHeart{
  intervalId: NodeJS.Timeout | null = null;
  start(){
    const { heartInterval, } = ob11Config;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      // ws的心跳是ws自己维护的
      postOB11Event(new OB11HeartbeatEvent(!!selfInfo.online, true, heartInterval), false, false);
    }, heartInterval);
  }

  stop(){
    if (this.intervalId){
      clearInterval(this.intervalId);
    }
  }
}

export const httpHeart = new HTTPHeart();
