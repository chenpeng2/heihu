import request from '../../utils/request';

const baseUrl = 'manufacture/v1/materialLot';

// 获取拆分记录列表
export const getSplitRecordList = (params) => {
  return request.get(`${baseUrl}/split/_list`, { params });
};

// 获取拆分记录详情
export const getSplitRecordDetail = (params) => {
  return request.get(`${baseUrl}/split/_info`, { params });
};

export default 'dummy';
