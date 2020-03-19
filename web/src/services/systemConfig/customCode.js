import request from '../../utils/request';

const baseUrl = 'manufacture/v1/batchGenerateRule';

// 自定义编码列表
export const getCustomCodeList = () => {
  return request.get(`/${baseUrl}/ruleList`);
};

// 创建自定义编码
export const createCustomCode = (params) => {
  return request.post(`/${baseUrl}/createRule`, params);
};

// 获取自定义编码的详情
export const getCustomCodeDetail = (params) => {
  return request.get(`/${baseUrl}/getRuleInfo`, { params });
};

// 编辑自定义编码
export const editCustomCode = (params) => {
  return request.put(`/${baseUrl}/updateRule`, params);
};

export default 'dummy';
