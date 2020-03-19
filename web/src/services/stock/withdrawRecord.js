import request from '../../utils/request';

const baseUrl = 'manufacture/v2/inventory';

// 查询退料记录
export const getWithdrawRecord = params => {
  if (!params) return;
  const { page = 10, size = 10, ...rest } = params || {};
  return request.post(`${baseUrl}/_list_admit_reverse_record?page=${page}&size=${size}`, rest);
};

export default 'dummy';
