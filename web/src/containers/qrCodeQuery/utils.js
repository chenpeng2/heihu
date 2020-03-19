import { primary, error } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';
import { baseFind } from 'src/utils/object';

export const LOCATION_STATUS = {
  storage: { name: '仓储中', value: 1 },
  transfer: { name: '转运中', value: 2 },
  allocation: { name: '发料中', value: 5 },
};

export const findLocationStatus = baseFind(LOCATION_STATUS);

// 业务状态
export const TRALLYING_STATUS = {
  inQC: { name: '质检中', value: 'inQC', color: primary, enumValue: 3 },
  inTrallying: { name: '盘点中', value: 'inTrallying', color: primary, enumValue: 1 },
  inWeighing: { name: '称量中', value: 'inWeighing', color: primary, enumValue: 2 },
  noBusiness: { name: '无业务', value: 'noBusiness', color: primary, enumValue: 0 },
};

// 根据enumValue来查找
export const findTrallyingStatusByEnumValue = baseFind(TRALLYING_STATUS, 'enumValue');

// 后端将这三个分为三个字段，不是枚举值
export const findTrallyingStatus = val => {
  const { inQC, inWeighing, inTrallying } = val || {};
  if (inQC) return TRALLYING_STATUS.inQC;
  if (inWeighing) return TRALLYING_STATUS.inWeighing;
  if (inTrallying) return TRALLYING_STATUS.inTrallying;

  return null;
};

// 将filter form中的业务状态改为对应的字段
export const formatFilterFormStatusValue = value => {
  if (!value) return null;

  if (value === TRALLYING_STATUS.inQC.value) return { inQC: 1 };
  if (value === TRALLYING_STATUS.inTrallying.value) return { trallyingStatus: 1 };
  if (value === TRALLYING_STATUS.inWeighing.value) return { inWeighing: 1 };
  // 无业务的时候这三个字段为0
  if (value === TRALLYING_STATUS.noBusiness.value) return { inQC: 0, trallyingStatus: 0, inWeighing: 0 };
};

/**
 * @description: 计算使用时间
 * @prd: 使用时间T=当前时间-创建时间，T为Min
 * 当T<1min时，显示话术「几秒钟」
 * 当1min<=T<60min时，显示T分钟
 * 当60min<=T<24*60min时，显示A小时B分钟，1<=A<23，当B=0时，显示A小时
 * 当24*60min<=T<30*24*60min时，显示C天D小时，1<=C<30，D向下取整，当D=0时，显示C小时
 * 当30*24*60<=T<365*30*24*60时，显示E个月，1<=E<12
 * 当365*30*24*60<=T时，显示F年G月，G向下取整，1<=G<12
 *
 * @date: 2019/4/3 下午5:12
 */
export const calTimeDiff = (from, to) => {
  if (!from || !to) return null;
  const diff = moment(to).diff(from, 'seconds');

  const MINUTE_SECONDS = 60;
  const HOUR_SECONDS = 60 * 60;
  const DAY_SECONDS = 24 * HOUR_SECONDS;
  const MONTH_SECONDS = 30 * DAY_SECONDS;
  const YEAR_SECONDS = 365 * MONTH_SECONDS;

  if (diff < MINUTE_SECONDS) return '几秒钟';
  if (diff >= MINUTE_SECONDS && diff < HOUR_SECONDS) return `${Math.floor(diff / MINUTE_SECONDS)} 分钟`;
  if (diff >= HOUR_SECONDS && diff < DAY_SECONDS) {
    const hour = Math.floor(diff / HOUR_SECONDS);
    const minute = Math.floor((diff % HOUR_SECONDS) / MINUTE_SECONDS);
    if (minute === 0) return `${hour}小时`;
    return `${hour}小时${minute}分钟`;
  }
  if (diff >= DAY_SECONDS && diff < MONTH_SECONDS) {
    const day = Math.floor(diff / DAY_SECONDS);
    const hour = Math.floor((diff % DAY_SECONDS) / HOUR_SECONDS);
    if (hour === 0) return `${day}天`;
    return `${day}天${hour}小时`;
  }
  if (diff >= MONTH_SECONDS && diff < YEAR_SECONDS) {
    const month = Math.floor(diff / MONTH_SECONDS);
    return `${month}个月`;
  }
  if (diff >= YEAR_SECONDS) {
    const year = Math.floor(diff / YEAR_SECONDS);
    const month = Math.floor((diff % YEAR_SECONDS) / MONTH_SECONDS);
    if (month === 0) return `${year}年`;
    return `${year}年${month}月`;
  }
  return replaceSign;
};

export default 'dummy';
