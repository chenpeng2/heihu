import { baseFind } from 'src/utils/object';
import LocalStorage from 'src/utils/localStorage';
import { findQualityStatus } from 'src/views/qualityManagement/constants';
import { findTrallyingStatusByEnumValue } from 'src/containers/qrCodeQuery/utils';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import { arrayIsEmpty } from 'src/utils/array';

export const SIGN = {
  larger: { name: '>', value: 1 },
  less: { name: '<', value: -1 },
  equal: { name: '=', value: 0 },
};

export const findSign = baseFind(SIGN);

// 监控条件
export const MONITOR_CONDITION = {
  validity: { name: '有效期', value: 'validityPeriod', signs: [SIGN.less, SIGN.larger] },
  lastTimeCheckTime: { name: '上次盘点时间', value: 'tallyingAt', signs: [SIGN.less, SIGN.larger] },
  createTime: { name: '创建时间', value: 'createdAt', signs: [SIGN.less, SIGN.larger] },
  qcStatus: { name: '质量状态', value: 'qcStatus', signs: [SIGN.equal] },
  businessStatus: { name: '业务状态', value: 'businessStatus', signs: [SIGN.equal] },
};

export const findMonitorCondition = baseFind(MONITOR_CONDITION);

// 时间精度
export const TIME_PRECISION = {
  hour: { name: '小时', value: 0 },
  day: { name: '天', value: 1 },
};

export const findTimePrecision = baseFind(TIME_PRECISION);

// 获取监控台详情url
export const getMonitorDetailPageUrl = (id, warehouseCode) =>
  `/stock/monitor/${id}/${encodeURIComponent(warehouseCode)}/detail`;

// 将监控台的仓库选择设置到本地
const KEY = 'MONITOR_WAREHOUSE';

export const setMonitorWarehouseInLocalStorage = value => LocalStorage.set(KEY, value);

export const getMonitorWarehouseInLocalStorage = () => LocalStorage.get(KEY);

// 根据rules来获取监控条件的中文描述
export const getMonitionConditionInChinese = rule => {
  if (!rule) return null;
  const { type, variables } = rule;
  const { status, span, timeScale, compare } = variables || {};
  const { name: _monitionConditionName } = findMonitorCondition(type) || {};

  const monitionConditionName = changeChineseToLocaleWithoutIntl(_monitionConditionName);

  if (type === MONITOR_CONDITION.lastTimeCheckTime.value || type === MONITOR_CONDITION.createTime.value) {
    const { name: signName } = findSign(compare) || {};
    const { name: timePrecision } = findTimePrecision(timeScale) || {};

    return `${monitionConditionName} ${signName} (${changeChineseToLocaleWithoutIntl(
      '监控时刻',
    )} - ${span} ${changeChineseToLocaleWithoutIntl(timePrecision)})`;
  }

  if (type === MONITOR_CONDITION.validity.value) {
    const { name: signName } = findSign(compare) || {};
    const { name: timePrecision } = findTimePrecision(timeScale) || {};

    return `${monitionConditionName} ${signName} (${changeChineseToLocaleWithoutIntl(
      '监控时刻',
    )} + ${span} ${changeChineseToLocaleWithoutIntl(timePrecision)})`;
  }

  if (type === MONITOR_CONDITION.qcStatus.value && !arrayIsEmpty(status)) {
    const { name } = findQualityStatus(status[0]);
    return `${monitionConditionName} = ${changeChineseToLocaleWithoutIntl(name)}`;
  }

  if (type === MONITOR_CONDITION.businessStatus.value) {
    const { name } = findTrallyingStatusByEnumValue(status) || {};
    return `${monitionConditionName} = ${changeChineseToLocaleWithoutIntl(name)}`;
  }

  return null;
};

export const getQrCodeDetailPageUrl = id => `/stock/monitor/qrCodeDetail/${id}`;

export default 'dummy';
