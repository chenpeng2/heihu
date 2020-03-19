import { PLAN_TICKET_BAITING, PLAN_TICKET_NORMAL, PLAN_TICKET_INJECTION_MOULDING } from 'constants';

const BASE_URL = '/cooperate/plannedTicket';

/**
 * 列表页路由 暂无必要参数
 */
export const toWorkOrderList = params => {
  return `${BASE_URL}/list`;
};

/**
 * 创建页路由 暂无必要参数
 */
export const toCreateWorkOrder = params => {
  return `${BASE_URL}/create`;
};

/**
 * 详情页路由（父工单）
 * @param {Number} category 计划工单自身类型 { 1: 普通， 2: 下料, 3: 注塑 }
 * @param {String} code 计划工单编号
 */
export const toWorkOrderDetail = ({ code, category = PLAN_TICKET_NORMAL, isInjectionMouldingChild }) => {
  if (Number(category) === PLAN_TICKET_BAITING) {
    return `${BASE_URL}/baiting/detail/${encodeURIComponent(code)}`;
  } else if (Number(category) === PLAN_TICKET_INJECTION_MOULDING) {
    return `${BASE_URL}/injectionMoulding/detail/${encodeURIComponent(code)}`;
  } else if (isInjectionMouldingChild) {
    return `${BASE_URL}/injectionMouldingChild/detail/${encodeURIComponent(code)}`;
  }
  return `${BASE_URL}/detail/${encodeURIComponent(code)}`;
};

/**
 * 详情页路由（子工单）
 * @param {Number} category 计划工单自身类型 { 1: 普通， 2: 下料, 3: 注塑 }
 * @param {String} code 计划工单编号
 * @param {parentOrder} Object 父工单信息
 */
export const toEditWorkOrder = params => {
  const { code, category, parentOrder } = params || {};
  if (Number(category) === PLAN_TICKET_BAITING) {
    // 下料工单暂时没有子工单
    return `${BASE_URL}/baiting/detail/${encodeURIComponent(code)}/edit`;
  }
  if (parentOrder && Number(category) === PLAN_TICKET_NORMAL) {
    return `${BASE_URL}/detail/${encodeURIComponent(code)}/editSubPlannedTicket`;
  }
  if (Number(category) === PLAN_TICKET_INJECTION_MOULDING) {
    return `${BASE_URL}/injectionMoulding/detail/${encodeURIComponent(code)}/edit`;
  }
  return `${BASE_URL}/detail/${encodeURIComponent(code)}/edit`;
};

export default toWorkOrderDetail;
