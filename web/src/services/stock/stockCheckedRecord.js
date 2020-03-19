import request from '../../utils/request';

const baseUrl = 'manufacture/v1/materialLot';
const baseUrl1 = 'manufacture/v1/materialLotTrallying';

// 获取盘点记录列表
export const getStockCheckedRecord = (params) => {
  return request.get(`${baseUrl}/trallyingRequests`, { params });
};

// 过账，确认盘点记录
export const confirmStockCheckRecord = (params) => {
  return request.post(`${baseUrl}/trallying/confirm`, params);
};

// 批量确认
export const batchEnsure = (params) => {
  return request.post(`${baseUrl}/trallying/sameAmount/_bulkConfirm`, params);
};

// 获取可以批量确认的数量
export const getBatchEnsureAmount = (params) => {
  return request.post(`${baseUrl}/trallying/sameAmount/count`, params);
};

// 获取按仓库导出的列表
export const getExportByWarehouseList = () => {
  return request.get(`${baseUrl}/export/_list`);
};

// 按仓库导出
export const exportByWarehouse = (params) => {
  return request.post(`${baseUrl}/export`, params);
};

// 获取按日导出的列表
export const getExportByDayList = (params) => {
  const { page, size } = params || {};
  return request.get(`${baseUrl1}/export/_listDay`, {
    params: { page: page || 1, size: size || 10, ...params },
  });
};

// 按日导出
export const exportByDay = (params) => {
  return request.post(`${baseUrl1}/export/day`, params);
};

// 获取按月导出的列表
export const getExportByMonthList = (params) => {
  return request.get(`${baseUrl1}/export/_listMonth`, { params });
};

// 按月导出
export const exportByMonth = (params) => {
  return request.post(`${baseUrl1}/export/month`, params);
};

export default 'dummy';
