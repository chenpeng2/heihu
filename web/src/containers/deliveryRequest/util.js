import _ from 'lodash';

import { round } from 'src/utils/number';
import { getMaterialAmountInWareHouse } from 'src/services/inventory';
import { qcStatus } from 'src/containers/storageAdjustRecord/constant';
import { primary, error, lightGrey, blueViolet, middleGrey } from 'src/styles/color';

/** 发货申请执行状态 */
export const DELIVERY_REQUEST_STATUS = {
  create: { name: '已创建', value: 0, color: lightGrey },
  issued: { name: '已下发', value: 1, color: primary },
  execute: { name: '执行中', value: 2, color: primary },
  done: { name: '已完成', value: 3, color: blueViolet },
  exception: { name: '异常结束', value: 5, color: error },
  cancel: { name: '已取消', value: 4, color: middleGrey },
};

// 根据val来找相关的信息
export const findDeliveryRequestType = data => {
  const values = Object.values(DELIVERY_REQUEST_STATUS);

  let res = null;

  values.forEach(i => {
    if (i && i.value === data) res = i;
  });

  return res;
};

export const DELIVERY_REQUEST_MATERIAL_STATUS = {
  create: { name: '已创建', value: 0, color: middleGrey },
  executed: { name: '已执行', value: 1, color: primary },
  done: { name: '已完成', value: 2, color: blueViolet },
};

export const findDeliveryRequestMaterialType = data => {
  const values = Object.values(DELIVERY_REQUEST_MATERIAL_STATUS);

  let res = null;

  values.forEach(i => {
    if (i && i.value === data) res = i;
  });

  return res;
};

// 格式化创建和编辑时候的表单的value
export const formatFormValue = value => {
  if (!value) return null;
  const { storage, materialList, requireTime, ...rest } = value;
  return {
    storageId: storage ? storage.key : null,
    items:
      Array.isArray(materialList) && materialList.length
        ? materialList
            .filter(i => i)
            .map(i => {
              const { customer, materialCode, materialUnit, deliveryTime, ...rest } = i || {};
              return {
                customerId: customer ? customer.key : null,
                materialCode: materialCode ? materialCode.key : null,
                materialUnit: materialUnit ? materialUnit.key : null,
                deliveryTime: deliveryTime ? new Date(deliveryTime).valueOf() : null,
                ...rest,
              };
            })
        : [],
    requireTime: requireTime ? new Date(requireTime).valueOf() : null,
    ...rest,
  };
};

// 获取可用库存
export const getUsefulStorage = async (materialCode, houseId) => {
  if (!materialCode || !houseId) return null;

  const materialAmountInWareHouseRes = await getMaterialAmountInWareHouse({
    materialCode,
    qcStatus: _.get(qcStatus, 'qualified.value', null),
    houseId,
  });
  const materialAmountInWareHouse = _.get(materialAmountInWareHouseRes, 'data.data');
  return Array.isArray(materialAmountInWareHouse) && materialAmountInWareHouse.length === 1
    ? materialAmountInWareHouse[0]
    : null;
};

// 根据单位转换数字
export const transformAmount = (materialInfo, targetUnit) => {
  // materialAmountInWareHouse的数字目前都是用主单位作为参考的。
  const { amount, material } = materialInfo || {};

  if (typeof amount !== 'number') return null;

  // unitId是主单位Id
  const { unitId, unitConversions } = material || {};
  let res = amount;
  if (targetUnit === unitId) {
    return res;
  }
  console.log(1);
  if (Array.isArray(unitConversions)) {
    console.log(2);
    unitConversions.forEach(i => {
      const { slaveUnitId, masterUnitCount, slaveUnitCount } = i || {};
      if (slaveUnitCount && slaveUnitId === targetUnit) {
        console.log(3);
        res = (amount * slaveUnitCount) / masterUnitCount;
      }
    });
  }

  return round(res);
};

export default 'dummy';
