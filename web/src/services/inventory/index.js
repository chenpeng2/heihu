import request from 'utils/request';

const baserUrl = 'manufacture/v2/inventory';

const defaultPage = 1;
const defaultSize = 10;

export const getInventoryList = params => {
  return request.get(`${baserUrl}/_list`, { params });
};

// 查询一级仓位下对应的未被占用的物料的库存信息
export const getInventoryLastMaterial = params => {
  return request.post(`${baserUrl}/_listByStorage`, params);
};

// 查询事务记录
export const getTransactionLogs = params => {
  return request.post(`${baserUrl}/transactionLogs`, params);
};

// 调整库存
export const updateInventory = params => {
  return request.put(`${baserUrl}/change/amount`, params);
};

// 查看库存下各种物料的库存
export const getMaterialAmountInWareHouse = params => {
  return request.get(`${baserUrl}/_list_by_house`, { params });
};

// 查询入库记录
export const getInStorageRecords = params => {
  return request.get(`${baserUrl}/_list_in_storage_record`, { params });
};

// 查询出库记录
export const getOutStorageRecords = params => {
  return request.get(`${baserUrl}/_list_out_storage_record`, { params });
};

// 创建入厂质检任务页面查物料接口
export const getAdmitMaterialList = params => {
  return request.post(
    `${baserUrl}/admitRecord/procure/materialLots?page=${params.page || defaultPage}&size=${params.size ||
      defaultSize}`,
    params,
  );
};

export default 'dummy';
