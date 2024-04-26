// QQ等级换算
import { QQLevel } from '../../core/src/entities';

export function calcQQLevel(level: QQLevel) {
  const { crownNum, sunNum, moonNum, starNum } = level;
  return crownNum * 64 + sunNum * 16 + moonNum * 4 + starNum;
}
