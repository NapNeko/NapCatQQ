import { Response } from 'express';
import { OB11Response } from '../action/OB11Response';
import { HttpServerBase } from '@/common/server/http';
import { OB11HeartbeatEvent } from '@/onebot/event/meta/OB11HeartbeatEvent';
import { postOB11Event } from '@/onebot/server/postOB11Event';

class OB11HTTPServer extends HttpServerBase {
  name = 'OneBot V11 server';

  handleFailed(res: Response, payload: any, e: Error) {
    res.send(OB11Response.error(e?.stack?.toString() || e.message || 'Error Handle', 200));
  }

  protected listen(port: number, host: string) {
    if (ob11Config.http.enable) {
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


class HTTPHeart {
  intervalId: NodeJS.Timeout | null = null;
  start(NewHeartInterval: number | undefined = undefined) {
    let { heartInterval } = ob11Config;
    if (NewHeartInterval && !Number.isNaN(NewHeartInterval)) {
      heartInterval = NewHeartInterval;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      // ws的心跳是ws自己维护的
      postOB11Event(new OB11HeartbeatEvent(!!selfInfo.online, true, heartInterval), false, false);
    }, heartInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

export const httpHeart = new HTTPHeart();
