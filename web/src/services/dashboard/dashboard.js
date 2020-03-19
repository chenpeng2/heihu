import request from 'utils/request';

const baseUrl = 'user/v1/dashbroad';

// 看板配置列表
export const getDashboardList = params => {
  return request.get(`${baseUrl}/client/web`, params);
};

export default 'dummy';
