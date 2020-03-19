import { arrayIsEmpty } from 'utils/array';
import log from 'src/utils/log';
import LocalStorage from 'utils/localStorage';
import _ from 'lodash';

export const getWorkOrderDetailPath = data => {
  const { category, workOrderCode, workOrderDirect } = data || {};
  if (!(category || workOrderDirect) || !workOrderCode) {
    log.error('获取计划工单详情路径必须传入category和workOrderCode');
    return '';
  }
  if (workOrderDirect === 2) {
    return `/cooperate/plannedTicket/injectionMoulding/detail/${encodeURIComponent(workOrderCode)}`;
  }
  if (category === 3) {
    return `/cooperate/plannedTicket/injectionMouldingChild/detail/${encodeURIComponent(workOrderCode)}`;
  }
  if (category === 2) {
    return `/cooperate/plannedTicket/baiting/detail/${encodeURIComponent(workOrderCode)}`;
  }
  return `/cooperate/plannedTicket/detail/${encodeURIComponent(workOrderCode)}`;
};

export const formatTask = e => {
  return {
    ...e,
    key: e.taskCode,
    // 如果是下料工单 工序投入物料展示工单计划投入物料
    inMaterial: e.category === 2 ? e.workOrderInMaterial : e.inMaterial,
  };
};

export const formatInjectTask = e => {
  const { startTime: planBeginTime, endTime: planEndTime, executeStatus: produceStatus } = e;
  return {
    ...formatTask(e),
    planBeginTime,
    planEndTime,
    produceStatus,
  };
};

export default 'dummy';
