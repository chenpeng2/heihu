// 成品批号规则service
import request from '../../utils/request';

const baseUrl = 'manufacture/v1/product_batch_number';

// 获取多个批号规则
export const getProductBatchCodeRules = (params) => {
  return request.get(`${baseUrl}/rule/_list`, { params });
};

// 停用批号规则
export const disableProductBatchCodeRule = (id) => {
  return request.post(`${baseUrl}/rule/${encodeURIComponent(id)}/_disable`);
};

// 启用批号规则
export const enableProductBatchCodeRule = (id) => {
  return request.post(`${baseUrl}/rule/${encodeURIComponent(id)}/_enable`);
};

// 批号规则详情
export const getProductBatchCodeDetail = (id) => {
  return request.get(`${baseUrl}/rule/${encodeURIComponent(id)}`);
};

// 批号规则操作历史
export const getProductBatchCodeRuleOperationHistory = (params) => {
  const { id } = params || {};
  return request.get(`${baseUrl}/rule/${encodeURIComponent(id)}/history`, { params });
};

// 创建批号规则
export const createProductBathCodeRule = (params) => {
  return request.post(`${baseUrl}/rule/_add`, params);
};

// 编辑批号规则
export const editProductBatchCodeRule = (id, params) => {
  return request.post(`${baseUrl}/rule/${encodeURIComponent(id)}/_update`, params);
};

export default 'dummy';
