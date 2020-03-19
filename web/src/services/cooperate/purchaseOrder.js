import request from 'utils/request';

const baseUrl = 'order/v1';

export const getPurchaseOrders = async params => {
  return request.get(`${baseUrl}/purchase_order/search`, {
    params,
  });
};

export const importPurchaseOrders = async data => {
  return await request.post(`${baseUrl}/purchase_order/import`, data);
};

export const queryPurchaseOrderImportLog = async params => {
  return await request.get(`${baseUrl}/purchase_order/import`, { params });
};

export const queryPurchaseOrderImportDetail = async importId => {
  return await request.get(`${baseUrl}/purchase_order/import/${importId}`);
};

export const createPurchaseOrder = async params => {
  return await request.post(`${baseUrl}/purchase_order`, params);
};

export const editPurchaseOrder = async (id, params) => {
  return await request.put(`${baseUrl}/purchase_order/${id}`, params);
};

export const getPurchaseOrderDetail = async code => {
  if (!code) return;
  return await request.get(`${baseUrl}/purchase_order/code/${encodeURIComponent(code)}`);
};

export const getPurchaseOrderDetailById = async id => {
  return await request.get(`${baseUrl}/purchase_order/${id}`);
};

export const deletePurchaseOrder = async id => {
  return await request.delete(`${baseUrl}/purchase_order/${id}`);
};

export const getPurchaseOrderOperationLog = async ({ code, ...params }) => {
  return await request.get(`${baseUrl}/purchase_order_operation_log/${encodeURIComponent(code)}`, { params });
};

export const getPurchaseOrderFinishReasons = async params => {
  return await request.get(`${baseUrl}/purchase_order_finish_reasons`, { params });
};

export const createPurchaseOrderFinishReason = async params => {
  return await request.post(`${baseUrl}/purchase_order_finish_reasons`, params);
};

export const updatePurchaseOrderFinishReasonStatus = async ({ id, status, ...params }) => {
  if (status === 1) {
    return await request.put(`${baseUrl}/purchase_order_finish_reasons/${id}/enabled`);
  }
  return await request.delete(`${baseUrl}/purchase_order_finish_reasons/${id}/enabled`);
};

export const editPurchaseOrderFinishReason = async ({ id, ...params }) => {
  return request.put(`${baseUrl}/purchase_order_finish_reasons/${id}`, params);
};

export const getDeliveryRequestByPurchaseOrder = async data => {
  return request.post(`${baseUrl}/deliveryRequest/delivery/purchaseOrder`, data);
};

/** 查询销售订单自定义字段 */
export const getSaleOrderCustomProperty = async () => {
  return request.get(`${baseUrl}/purchase_order_custom_field_config`);
};

/** 保存销售订单自定义字段 */
export const saveSaleOrderCustomProperty = async data => {
  return request.post(`${baseUrl}/purchase_order_custom_field_config`, data);
};


export default request;
