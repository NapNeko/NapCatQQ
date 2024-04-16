import { Response } from 'express';
import { OB11Response } from '../action/OB11Response';
import { HttpServerBase } from '@/common/server/http';
import { actionHandlers, actionMap } from '../action';
import { ob11Config } from '@/onebot11/config';

class OB11HTTPServer extends HttpServerBase {
  name = 'OneBot V11 server';

  handleFailed(res: Response, payload: any, e: any) {
    res.send(OB11Response.error(e.stack.toString(), 200));
  }

  protected listen(port: number) {
    if (ob11Config.enableHttp) {
      super.listen(port);
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
