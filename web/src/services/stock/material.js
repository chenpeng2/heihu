import request from '../../utils/request';

const baseUrl = 'manufacture/v1/materialLot';
const defaultPage = 1;
const defaultSize = 10;

export const getMaterialLotList = params => {
  const { page, size, ...rest } = params;
  return request.get(`${baseUrl}/_list`, { params: { page: page || defaultPage, size: size || defaultSize, ...rest } });
};

// 导入二维码
export const importMaterialLot = params => {
  return request.post('manufacture/material_lot_import/_import', params);
};

// 查看导入错误历史列表
export const importLogs = params => {
  return request.get('manufacture/material_lot_import/_import_list', { params });
};

// 查看导入错误的详情
export const importLogDetail = params => {
  const { importId } = params || {};
  return request.get(`manufacture/material_lot_import/_import_detail/${importId}`, { params });
};

// 查看导入错误的失败原因列表
export const importLogDetailReason = params => {
  const { importId } = params || {};
  return request.get(`manufacture/material_lot_import/_import_error_list/${importId}`, { params });
};

// 批量置空二维码
export const batchClearQrcode = params => {
  return request.post(`${baseUrl}/_bulk_empty`, params);
};

// 批量置空二维码。有事务
export const batchClearQrCodeWithTransaction = params => {
  const { ids, transactionCode } = params || {};
  return request.post(`${baseUrl}/_bulk_empty/transaction?transactionCode=${encodeURIComponent(transactionCode)}`, ids);
};

export default 'dummy';
