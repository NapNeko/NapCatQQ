import { OB11Return } from '../types';

import { isNull } from '../../common/utils/helper';

export class OB11Response {
  static res<T>(data: T, status: string, retcode: number, message: string = ''): OB11Return<T> {
    return {
      status: status,
      retcode: retcode,
      data: data,
      message: message,
      wording: message,
      echo: null
    };
  }

  static ok<T>(data: T, echo: any = null) {
    const res = OB11Response.res<T>(data, 'ok', 0);
    if (!isNull(echo)) {
      res.echo = echo;
    }
    return res;
  }

  static error(err: string, retcode: number, echo: any = null) {
    const res = OB11Response.res(null, 'failed', retcode, err);
    if (!isNull(echo)) {
      res.echo = echo;
    }
    return res;
  }
}
