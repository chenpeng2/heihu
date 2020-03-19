import request from '../../utils/request';

const baseUrl = 'order/v1';

// 入库单列表
export const getInboundOrderList = async (params: any): any => {
  const { pageSieze: size = 10 } = params;
  return request.get(`${baseUrl}/_inbound_order/_list`, { params: { ...params, size } });
};

// 取消入库单
export const abortInboundOrder = async (params: any): any => {
  return request.post(`${baseUrl}/_inbound_order/_abort?inboundOrderCode=${params}`);
};

// 结束入库单
export const finishInboundOrder = async (params: any): any => {
  return request.post(`${baseUrl}/_inbound_order/_finish?inboundOrderCode=${params}`);
};

// 添加入库单
export const addInboundOrder = async (params: any): any => {
  return request.post(`${baseUrl}/_inbound_order/_add`, params);
};

// 下发入库单
export const issueInboundOrder = async (params: any): any => {
  return request.post(`${baseUrl}/_inbound_order/_issue?inboundOrderCode=${params}`);
};

// 更新入库单
export const updateInboundOrder = async (params: any): any => {
  return request.post(`${baseUrl}/_inbound_order/_update`, params);
};

// 入库单详情
export const getInboundOrderDetail = async (params: any): any => {
  return request.get(`${baseUrl}/_inbound_order/_detail`, { params });
};

// 获取入厂批次号
export const getInboundBatch = async () => {
  return request.get(`${baseUrl}/_inbound_order/_gene_inbound_batch`);
};

// 获取入库单号
export const getInboundOrderCode = async () => {
  return request.get(`${baseUrl}/_inbound_order/_gene_inbound_order_code`);
};

// 导入入库单
export const importInboundOrder = async (params: any): any => {
  return request.post(`${baseUrl}/_inbound_order/_import`, params);
};

// 入库单导入日志详情失败原因列表
export const getInboundOrderImportDetail = async (params: any): any => {
  return request.get(`${baseUrl}/_inbound_order/_import_fail_detail`, { params });
};

// 入库单导入日志列表
export const getInboundOrderImportList = async (params: any): any => {
  return request.get(`${baseUrl}/_inbound_order/_import_log`, { params });
};
