import request, { getCustomerInstance } from 'src/utils/request';

const baseUrl = 'def/v1/capacity';

export const getProductivityStandardList = async params => {
  return request.get(`${baseUrl}`, { params });
};

export const getProductivityStandardDetail = async code => {
  return request.get(`${baseUrl}/${code}`);
};

export const getProductivityStandardOperationHistory = async (code, params) => {
  return request.get(`${baseUrl}/${code}/list_log`, { params });
};

export const changeProductivityStandardStatus = async (code, params) => {
  return request.put(`${baseUrl}/${code}/status`, params);
};

export const createProductivityStandard = async (params, errorHandle) => {
  // errorHandle是用来生成包含额外的错误处理逻辑的request的
  const _request = getCustomerInstance(errorHandle);

  return _request.post(`${baseUrl}`, params);
};

export const editProductivityStandard = async (code, params, errorHandle) => {
    // errorHandle是用来生成包含额外的错误处理逻辑的request的
  const _request = getCustomerInstance(errorHandle);

  return _request.put(`${baseUrl}/${code}`, params);
};


export const importProductivityStandard = (data) => request.post(`${baseUrl}/bulk`, data);

export const importList = params => request.get(`${baseUrl}/import_log`, { params });

export const importDetail = (importId) => request.get(`${baseUrl}/${importId}/_detail`);

export default 'dummy';
