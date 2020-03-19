import _ from 'lodash';
import LocalStorage from 'src/utils/localStorage';
import { replaceSign } from 'src/constants';
import { Big } from 'src/utils/number';

export const stockCheckRecordStatus = {
  post: { name: '已过账', value: 1 },
  inventory: { name: '盘点中', value: 0 },
};

export const findStockCheckRecordStatus = num => {
  let res = null;

  Object.values(stockCheckRecordStatus).forEach(i => {
    if (i && i.value === num) res = i;
  });

  return res;
};

export const saveColumnConfig = value => {
  LocalStorage.set('stockCheckRecordColumnConfig', value);
};

export const getColumnConfig = () => {
  return LocalStorage.get('stockCheckRecordColumnConfig') || null;
};

export const getStockCheckResult = (amountAfter, amountBefore) => {
  const res = new Big(amountAfter).minus(amountBefore);
  const resValue = res.valueOf();

  if (resValue === 0) {
    return replaceSign;
  }

  let sign = null;
  if (resValue > 0) {
    sign = '盘盈';
  }
  if (resValue < 0) {
    sign = '盘亏';
  }

  return `${sign}, ${resValue}`;
};

export const getFormatDay = (day) => {
  return day.split('').filter(n => !_.isNaN(parseInt(n, 10))).join('');
};

export default 'dummy';
