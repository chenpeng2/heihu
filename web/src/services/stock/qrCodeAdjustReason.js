// 二维码调整原因
import request from '../../utils/request';

const baseUrl = 'manufacture/v2/inventory';

// 获取二维码调整原因列表
export async function getReasons(params) {
  return request.get(`${baseUrl}/transactions`, { params });
}

// 创建二维码调整原因
export const createReason = (params) => {
  return request.post(`${baseUrl}/transactions`, params);
};

// 启用或停用事务
export const changeReasonStatus = (code, params) => {
  if (!code) return;

  return request.patch(`${baseUrl}/transactions/${code}/enable`, params);
};

// 编辑事务
export const editReason = (code, params) => {
  if (!code) return;

  return request.put(`${baseUrl}/transactions/${code}/edit`, params);
};

export default request;
