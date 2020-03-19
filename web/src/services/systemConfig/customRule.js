import request from '../../utils/request';

const baseUrl = 'manufacture/v1';

// 自定义规则列表
export const getCustomRuleList = () => {
  return request.get(`/${baseUrl}/fifo/_list`, { loading: true });
};

// 获取自定义规则详情
export const getCustomRuleDetail = params => {
  return request.get(`/${baseUrl}/fifo/_info`, { params });
};

// 更新自定义规则
export const updateCustomRule = params => {
  return request.put(`/${baseUrl}/fifo/updateFifo`, params);
};

// 更新自定义规则的状态
export const updateCustomRuleStatus = params => {
  return request.put(`/${baseUrl}/fifo/updateFifoStatus`, params);
};

export default 'dummy';
