import _ from 'lodash';
import { getInventoryLastMaterial } from 'src/services/inventory';

import { STATUS, useLogic } from './constant';

export const findStatus = s => {
  let res = null;
  Object.entries(STATUS).forEach(([key, value]) => {
    if (value.value === s) {
      res = value;
    }
  });

  return res;
};

export const findUseLogic = s => {
  let res = null;
  Object.values(useLogic).forEach(a => {
    if (a && a.value === s) {
      res = a;
    }
  });

  return res;
};

// 验证库存数量是否足够
export const getStorageMaterialLastAmountMessage = data => {
  if (!Array.isArray(data)) return;
  return getInventoryLastMaterial(data).then(res => {
    return _.get(res, 'data.data');
  });
};
export default 'dummy';
