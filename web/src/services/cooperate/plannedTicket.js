import request from 'utils/request';
import { Dimension } from 'containers/plannedTicket/ProdProgress/constants';

const defaultPage = 1;
const defaultSize = 10;
const baseUrl = 'scheduling/v1';

// 列表
export const queryPlannedTicketList = async ({ page = defaultPage, size = defaultSize, ...params }) => {
  return request.get(`${baseUrl}/work_order/_list`, {
    params: { page, size, ...params },
  });
};

// 模糊匹配所有的工单编号
export const queryWorkOrderListAllLike = ({ page = defaultPage, size = defaultSize, ...params }) =>
  request.get(`${baseUrl}/work_order/_list_all_like`, {
    params: { page, size, ...params },
  });

// 创建普通计划工单
export const createPlannedTicket = async data => {
  return request.post(`${baseUrl}/work_order`, data, { loading: true });
};

// 创建下料计划工单
export const createBaitingWorkOrder = async data => {
  return request.post(`${baseUrl}/work_order/baiting`, data, { loading: true });
};

// 创建注塑计划工单
export const createInjectMoldWorkOder = data =>
  request.post(`${baseUrl}/work_order/inject_mold`, data, { loading: true });

// 导入
export const importPlannedTicket = async data => {
  return request.post(`${baseUrl}/work_order/_bulk`, data);
};

// 编辑普通计划工单
export const editPlannedTicket = async ({ code, ...data }) => {
  return request.put(`${baseUrl}/work_order/${encodeURIComponent(code)}`, data);
};

// 编辑下料计划工单
export const editBaitingWorkOrder = async data => {
  return request.post(`${baseUrl}/work_order/baiting_update`, data);
};

export const editInjectionMouldingWorkOrder = data => request.post(`${baseUrl}/work_order/inject_mold_update`, data);

// 普通计划工单详情
export const queryPlannedTicketDetail = async code => {
  return request.get(`${baseUrl}/work_order/${encodeURIComponent(code)}`);
};

// 下料计划工单详情
export const queryBaitingWorkOrderDetail = async code => {
  return request.get(`${baseUrl}/work_order/${encodeURIComponent(code)}/baiting_info`);
};

// 注塑计划工单详情
export const getInjectionMouldingWorkOderDetail = code => request.get(`${baseUrl}/work_order/${code}/inject_mold_info`);

// 通关注塑工单获取注塑子工单
export const getWorkOrdersByInjectionMoulding = code => request.get(`${baseUrl}/work_order/${code}/inject_mold_sub`);
// 取消
export const cancelPlannedTicket = async code => {
  return request.put(`${baseUrl}/work_order/${encodeURIComponent(code)}/_cancel`);
};
// 取消注塑工单
export const cancelInjectionMoldingPlannedTicket = code =>
  request.put(`${baseUrl}/work_order/${encodeURIComponent(code)}/inject_mold_cancel`);

// 操作记录
export const queryPlannedTicketOperationLog = async ({ code, page = defaultPage, size = defaultPage, ...params }) => {
  return request.get(`${baseUrl}/work_order/${encodeURIComponent(code)}/log`, {
    params: { page, size, ...params },
  });
};

// 导入日志
export const queryPlannedTicketImportLog = async ({ page = defaultPage, size = defaultSize, ...params }) => {
  return request.get(`${baseUrl}/work_order/import_log`, {
    params: { page, size, ...params },
  });
};

// 导入日志详情
export const queryPlannedTicketImportDetail = async importId => {
  return request.get(`${baseUrl}/work_order/${encodeURIComponent(importId)}/_detail`);
};

// 创建子计划工单
export const createSubPlannedTicket = (code, params) => {
  return request.post(`${baseUrl}/work_order/${encodeURIComponent(code)}/_sub_create`, params);
};

// 获取创建子计划工单，选中的物料的可选工序和默认数量
export const getSubProcessAndAmounts = (code, materialCode) => {
  return request.get(`${baseUrl}/work_order/${encodeURIComponent(code)}/_get_range`, { params: { materialCode } });
};

// 是否存在子计划工单
export const hasSubWorkOrders = code => {
  return request.get(`${baseUrl}/work_order/${encodeURIComponent(code)}/has_sub`);
};

// 编辑子计划工单
export const editSubPlannedTicket = (code, data) => {
  return request.put(`${baseUrl}/work_order/${encodeURIComponent(code)}/update_sub`, data);
};

// 获取计划工单下所需采购的物料
export const getWorkOrderProcureMaterials = params => {
  return request.get(`${baseUrl}/work_order/procure_materials`, {
    params: { ...params, filterByProjectStatus: true },
  });
};

// 申请审批（可批量）
export const applyAuditPlannedTicket = params => {
  return request.post(`${baseUrl}/work_order/apply_audit`, params);
};

// 审批计划工单
export const auditPlannedTicket = ({ code, ...params }) => {
  return request.post(`${baseUrl}/work_order/${code}/audit`, params);
};

// 删除计划工单
export const deletePlannedTicket = code => request.delete(`${baseUrl}/work_order/${encodeURIComponent(code)}`);

// 是否能删除计划工单
export const canIDeletePlannedTicket = code =>
  request.get(`${baseUrl}/work_order/${encodeURIComponent(code)}/can_delete`);

// 根据工单查询相关的工序信息
export const queryWorkOrderProcessInfoList = (code, params) => {
  return request.get(`${baseUrl}/work_order/${encodeURIComponent(code)}/process_qc`, { loading: true, params });
};

/** 查询计划工单自定义字段 */
export const getWorkOrderCustomProperty = async () => {
  return request.get(`${baseUrl}/custom_field/_all`);
};

/** 保存计划工单自定义字段 */
export const updateWorkOrderCustomProperty = async data => {
  return request.put(`${baseUrl}/custom_field/_update`, data);
};

/**
 * 根据父工单生成系统推荐的子工单数据
 *
 * @description 如果需要计算的是节点a的子工单，就把节点a以及它的所有父级信息作为参数
 */
export const genSubPlanWorkOrderData = parentData => {
  return request.post(`${baseUrl}/work_order/_gen_work_order`, parentData);
};

/** 批量创建子工单前 - 校验顶层计划工单 */
export const checkPlanWorkOrder = workOrderData => {
  return request.post(`${baseUrl}/work_order/_create_check`, workOrderData, {
    loading: true,
  });
};

/** 父子工单相关生产进度信息 */
export const queryWorkOrderTreeProdProgress = (workOrderCode, dimension = Dimension.WORK_ORDER) => {
  /** 工单维度 */
  let path = '_flat_work_order_progress';
  if (dimension !== Dimension.WORK_ORDER) {
    /** 工序维度 */
    path = '_flat_process_progress';
  }

  return request.get(`${baseUrl}/work_order/${path}`, { params: { workOrderCode } }, { loading: true });
};

/** 根据工单批量生成转移申请 */
export const genTransferRequest = workOrerData => {
  return request.post(`${baseUrl}/work_order/_gen_transfer_request`, workOrerData);
};

/**
 * 查询工单「非取消」的转移申请编号
 *
 * @param code {String} 工单编号
 *
 */
export const queryWorkOrderTransReqCodes = code => {
  return request.get(`${baseUrl}/work_order/${encodeURIComponent(code)}/_transfer_record`);
};

export default 'dummy';
