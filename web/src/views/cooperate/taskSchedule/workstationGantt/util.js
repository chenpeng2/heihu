import moment, { formatToUnix } from 'utils/time';

// startTime endTime 与外部公用所以不在format里再做处理
export const formatQueryParams = params => {
  const { finished, purchaseOrderCode, workOrderCode, materialCode } = params;
  return {
    finished: !!finished,
    purchaseOrderCode: purchaseOrderCode && purchaseOrderCode.key,
    workOrderCode: workOrderCode && workOrderCode.key,
    materialCode: materialCode && materialCode.key,
  };
};

export default 'dummy';
