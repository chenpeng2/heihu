import request from '../../utils/request';

const baseUrl = 'def/v1/suppliers';

export const getProviderList = (params) => {
  return request.get(`${baseUrl}`, { params });
};

export const stopUseProvider = (code) => {
  if (!code) return;
  return request.delete(`${baseUrl}/${encodeURIComponent(code)}/enabled`);
};

export const useProvider = (code) => {
  if (!code) return;
  return request.put(`${baseUrl}/${encodeURIComponent(code)}/enabled`);
};

export const createProvider = (params) => {
  return request.post(`${baseUrl}`, params);
};

export const getProviderDetail = (code) => {
  return request.get(`${baseUrl}/${code}`);
};

export const editProvider = (code, params) => {
  return request.patch(`${baseUrl}/${code}`, params);
};

export default 'dummy';
