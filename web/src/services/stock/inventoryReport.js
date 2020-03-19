import request from '../../utils/request';

const baseUrl = '/manufacture/v2/inventory';

// 获取物料汇总报表的列表数据
export const getReports = (params) => {
   return request.post(`${baseUrl}/_reports`, params);
};

// 获取物料汇总报表数据的供应商
export const getReportsSupplier = (params) => {
  return request.get(`${baseUrl}/_report/_group_by_supplier`, { params });
};

// 获取物料汇总报表数据的供应商批次
export const getReportsMfgBatch = (params) => {
  return request.get(`${baseUrl}/_report/_group_by_mfg_batch`, { params });
};

// 获取物料汇总报表数据的入厂批次
export const getReportsInboundBatch = (params) => {
  return request.get(`${baseUrl}/_report/_group_by_inbound_batch`, { params });
};

