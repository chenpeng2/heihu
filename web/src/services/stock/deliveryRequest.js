import request from '../../utils/request';

const baseUrl = 'order/v1';

// 获取发运申请列表
export const getDeliveryRequests = (params) => {
  return request.get(`${baseUrl}/deliveryRequest/list`, { params });
};

// 更新发运申请状态
export const updateDeliveryRequestStatus = (params) => {
  return request.patch(`${baseUrl}/deliveryRequest/status`, params);
};

// 更新发运申请
export const updateDeliveryRequest = (params) => {
  return request.put(`${baseUrl}/deliveryRequest`, params);
};

// 获取发运申请的申请编号
export const getDeliveryRequestCode = () => {
  return request.post(`${baseUrl}/deliveryRequest/sequence`);
};

// 创建发运申请
export const createDeliveryRequest = (params) => {
  return request.post(`${baseUrl}/deliveryRequest`, params);
};

// 获取发运申请详情
export const getDeliveryRequestDetail = (code) => {
  return request.get(`${baseUrl}/deliveryRequest/${code}/detail`);
};

export default 'dummy';
