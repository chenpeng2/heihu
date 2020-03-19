// 成品批号service
import request from '../../utils/request';

const baseUrl = 'manufacture/v1/product_batch_number';

// 获取多个批号
export const getProductBatchCodes = (params) => {
  return request.get(`${baseUrl}/batch_number/_list`, { params });
};

// 自动生成产品批次号
export const generateProductBatchCode = (params) => {
  return request.post(`${baseUrl}/batch_number/_generate`, params);
};

// 手工生成产品批次号
export const manualGenerateProductBatchCode = (params) => {
  return request.post(`${baseUrl}/batch_number/_generateManually`, params);
};

export default 'dummy';
