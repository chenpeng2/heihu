import BigJs from 'big.js';
import { formatToUnix } from 'utils/time';

export const formatFormValue = values => {
  const {
    startTimePlanned,
    endTimePlanned,
    amounts,
    workstationId,
    locked,
    operatorGroupId,
    operatorIds,
    workingTime,
    workingTimeUnit,
    workOrderCode,
    mouldUnit,
    sourceWarehouseCode,
  } = values;
  const submitValue = {
    workOrderCode,
    workstationId: workstationId && workstationId.value.split('-')[1],
    mouldUnit: mouldUnit && mouldUnit.id ? mouldUnit : undefined,
    amounts: amounts.map(e => ({
      ...e,
      planAmount: parseFloat(e.planAmount.toFixed(6)),
    })),
    operatorGroupId: operatorGroupId ? operatorGroupId.key : null,
    executorIds: Array.isArray(operatorIds) ? operatorIds.map(i => i && i.key) : null,
    sourceWarehouseCode: sourceWarehouseCode && sourceWarehouseCode.key,
    locked,
  };
  if (workingTimeUnit === 'h') {
    submitValue.workingTime = new BigJs(workingTime).times(60 * 60 * 1000).valueOf();
  } else if (workingTimeUnit === 'm') {
    submitValue.workingTime = new BigJs(workingTime).times(60 * 1000).valueOf();
  } else if (workingTimeUnit === 'd') {
    submitValue.workingTime = new BigJs(workingTime).times(24 * 60 * 60 * 1000).valueOf();
  }
  submitValue.planBeginTime = formatToUnix(startTimePlanned.set({ second: 0, millisecond: 0 }));
  submitValue.planEndTime = formatToUnix(endTimePlanned.set({ second: 0, millisecond: 0 }));
  submitValue.timeUnit = workingTimeUnit;
  return submitValue;
};

export default 'dummy';
