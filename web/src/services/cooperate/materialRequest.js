/**
 * @description:
 * @swagger:http://material-request-dev.test.blacklake.tech/swagger-ui.html#
 *
 * @date: 2019/5/5 下午1:29
 */
import request from 'src/utils/request';

const baseUrl = 'material_request';

export const getProjectMaterialNodes = params => {
  return request.post(`${baseUrl}/v1/mr/_queryProjectMaterialNeeds`, params);
};

export const createMaterialRequest = params => {
  return request.post(`${baseUrl}/v1/mr/_addForWeb`, params);
};

export const getMaterialRequestList = params => {
  return request.get(`${baseUrl}/v1/mr/_listForWeb`, { params });
};

// 下发物料请求
export const dispatchMaterialRequest = code => {
  return request.post(`${baseUrl}/v1/mr/_dispatch/${code}`);
};

// 取消物料请求
export const cancelMaterialRequest = code => {
  return request.post(`${baseUrl}/v1/mr/_cancel/${code}`);
};

export const getMaterialRequestDetail = code => {
  return request.get(`${baseUrl}/v1/mr/_detailForWeb/${code}`);
};

// 编辑物料请求
export const editMaterialRequest = (code, params) => {
  return request.post(`${baseUrl}/v1/mr/_updateForWeb/${code}`, params);
};

// 转移申请列表
export const queryTransferApplyList = params => {
  const { page, size, ...rest } = params || {};
  return request.post(`${baseUrl}/v2/mr/search?page=${page || 1}&size=${size || 10}`, rest);
};

// 更新转移申请的状态
export const updateStatus = params => {
  return request.patch(`${baseUrl}/v2/mr/status`, params);
};

// 获取转移申请的物料列表详情
export const getMaterialListDetail = params => {
  return request.get(`${baseUrl}/v2/mr/header/items`, { params });
};

// 获取转移申请物料列表的每一条的执行记录
export const getMaterialExecuteLog = params => {
  return request.get(`${baseUrl}/v2/mr/item/logs`, { params });
};

// 获取转移申请的操作记录
export const getOperationLogs = params => {
  return request.get(`${baseUrl}/v2/mr/header/logs`, { params });
};

// 创建转移申请
export const createTransferApply = params => {
  return request.post(`${baseUrl}/v2/mr`, params);
};

// 获取转移申请的code
export const getTransferApplyCode = params => {
  return request.get(`${baseUrl}/v2/mr/header/code`, params);
};

// 获取转移申请的可用库存
export const getAvailableAmount = params => {
  return request.post(`${baseUrl}/v2/mr/header/availableAmount`, params);
};

// 获取转移申请的详情
export const getTransferApplyDetail = id => {
  return request.get(`${baseUrl}/v2/mr/${id}/detail`);
};

// 编辑转移申请的详情
export const editTransferApply = params => {
  return request.put(`${baseUrl}/v2/mr`, params);
};

// 根据任务获取转移申请
export const getTransferApplyFromTask = (body, params) => {
  return request.post('scheduling/v1/material_request/_bulk_get', body, { params });
};

// 根据任务获取合并后转移申请
export const getTransferApplyFromTaskAfterMerge = params => {
  return request.post('scheduling/v1/material_request/_bulk_merge', params);
};

// 批量创建转移申请（排程）
export const batchCreateTransferApply = params => {
  return request.post('scheduling/v1/material_request/_bulk_create', params);
};

// 占用信息（物料汇总报表）
export const getOccupyItems = params => {
  return request.get(`${baseUrl}/v2/mr/getOccupyItems`, { params });
};

// 合并转移申请
export const mergeTransferApply = params => {
  return request.post(`${baseUrl}/v2/mr/mergeMaterialTransfers`, params);
};

export default 'dummy';
