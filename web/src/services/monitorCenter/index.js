/**
 * @description: 监控台接口
 *
 * @date: 2019/8/16 上午10:39
 */

import request from '../../utils/request';

const BASE_URL = 'manufacture/v1/materialLot';

// 获取所有的监控条件
export const getMonitorConditions = params => {
  return request.get(`${BASE_URL}/watch/_list`, { params });
};

// 创建监控条件
export const createMonitorCondition = params => {
  return request.post(`${BASE_URL}/watch/condition`, params);
};

// 编辑监控条件
export const updateMonitorCondition = params => {
  return request.put(`${BASE_URL}/watch/condition`, params);
};

// 获取监控条件详情
export const getMonitorConditionDetail = id => {
  return request.get(`${BASE_URL}/watch/condition/detail?conditionId=${encodeURIComponent(id)}`);
};

// 根据监控条件来拉取二维码的列表
export const getQrCodeListByMonitorCondition = params => {
  return request.get(`${BASE_URL}/watch/materialLots`, { params });
};

// 拉取条件的二维码数量
export const getQrCodeAmountByCondition = params => {
  if (!params || !params.conditionId || !params.warehouseCode) return;
  return request.get(`${BASE_URL}/watch/materialLots/count`, { params });
};

export default 'dummy';
