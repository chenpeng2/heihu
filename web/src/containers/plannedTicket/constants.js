/** 成品批次规则 */
export const PRODUCT_BATCH_TYPE_INPUT = 1; // 手动输入
export const PRODUCT_BATCH_TYPE_RULE = 2; // 按规则生成

export const productBatchTypeMap = {
  [PRODUCT_BATCH_TYPE_INPUT]: '手动输入',
  [PRODUCT_BATCH_TYPE_RULE]: '按规则生成',
};

/** 工艺方式 */
export const PROCESS_TYPE_PROCESS_ROUTE = 'processRoute'; // 工艺路线
export const PROCESS_TYPE_MBOM = 'mbom'; // mbom
export const PROCESS_TYPE_EBOM = 'ebom'; // 物料清单
export const PROCESS_TYPE_PROCESS_ROUTE_AND_EBOM = 'processRouteEbom'; // 工艺路线+物料清单

export const processTypeMap = {
  [PROCESS_TYPE_PROCESS_ROUTE]: '工艺路线',
  [PROCESS_TYPE_MBOM]: 'mbom',
  [PROCESS_TYPE_PROCESS_ROUTE_AND_EBOM]: '工艺路线+物料清单',
};

export const WORK_ORDER_CANCEL_TIP_TYPE_HAS_SUB = 'hasSub'; // 存在子计划工单
export const WORK_ORDER_CANCEL_TIP_TYPE_HAS_TRANS_REQ = 'hasTransReq'; // 存在非「已取消」的转移申请
export const WORK_ORDER_CANCEL_TIP_TYPE_REGULAR = 'regular'; // 可常规取消

const CancelTipParams = 'cancelTipParams';

export const workOrderCancelTipMap = {
  [WORK_ORDER_CANCEL_TIP_TYPE_HAS_SUB]:
    '取消计划工单后，该工单下计划状态为"新建、已排程"的子计划工单也会被取消，确定取消吗？',
  [WORK_ORDER_CANCEL_TIP_TYPE_HAS_TRANS_REQ]: `取消计划工单后，已排程的计划生产任务也会被取消，且此计划工单关联以下转移申请：${CancelTipParams} ，确认取消此工单？`,
  [WORK_ORDER_CANCEL_TIP_TYPE_REGULAR]: '取消计划工单后，已排程的计划生产任务也会被取消，确认取消吗？',
};

export const getWorkOrderCancelTip = (type, params) => {
  return !params ? workOrderCancelTipMap[type] : workOrderCancelTipMap[type].replace(CancelTipParams, params);
};

export default 'dummy';
