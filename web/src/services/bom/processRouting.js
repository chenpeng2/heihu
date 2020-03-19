import request from '../../utils/request';

const defaultSize = 10;
const baseUrl = 'def/v1';

export const getProcessRoutes = params => {
  return request.get(`${baseUrl}/process_routes`, { params });
};

export const updateProcessRouteStatus = params => {
  const { code, status } = params || {};
  return request.put(`${baseUrl}/process_routes/${code}/status`, { status });
};

export const enableAllProcessUnderProcessRouting = params => {
  const { processRouteCode } = params || {};
  return request.put(`${baseUrl}/process_routes/${processRouteCode}/start_process`);
};

export const queryProcessRoutingLogs = async params => {
  const { page, size, code, ...rest } = params;
  return request.get(`${baseUrl}/process_routing_operation_log/${code}`, {
    params: { page, size: size || defaultSize, ...rest },
  });
};

export const getProcessRoutingByCode = async params => {
  const { code } = params;
  return request.get(`${baseUrl}/process_routing/${code}`);
};

export const getProcessRoutingCode = async () => {
  return await request.post(`${baseUrl}/process_routes/codes`);
};

export const addProcessRouting = params => {
  return request.post(`${baseUrl}/process_routes`, params);
};

export const updateProcessRouting = (code, params) => {
  return request.put(`${baseUrl}/process_routes/${code}`, params);
};

// 导入工艺路线
export const importProcessRouting = (params) => {
  return request.post(`${baseUrl}/process_routes/bulk_import`, params);
};

// 工艺路线导入日志
export const importProcessRoutingLog = (params) => {
  return request.get(`${baseUrl}/processRoutingLog`, { params });
};

// 工艺路线导入日志详情
export const importProcessRoutingLogDetail = (params) => {
  const { importId, ...rest } = params;
  return request.get(`${baseUrl}/processRoutingDetailLog/${importId}`, { params: rest });
};

export default 'dummy';
