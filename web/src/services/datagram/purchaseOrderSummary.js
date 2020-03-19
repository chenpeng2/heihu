import request from '../../utils/request';

const baseUrl = 'datagram/v1';

export async function queryPurchaseOrderSummary(data) {
  return request.post(`${baseUrl}/purchase_order_summary?size=${data.size || 10}&page=${data.page || 1}`, data);
}

export default request;
