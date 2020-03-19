import request from 'utils/request';

const base = 'def/v1/warehouse';

export const getStoreHouseList = params => request.get(`${base}`, { params });

export const getStoreHouse = code => request.get(`${base}/${code}`);

export const getStoreHouseByWorshop = (workshopId, status) =>
  request.get(`${base}/${workshopId}/_workshop`, {
    params: { status },
  });

export const createStoreHouse = data => request.post(`${base}`, data);

export const editStoreHouse = params => {
  const { code, updateWareHouseRequestDTO } = params;
  return request.put(`${base}/${code}`, updateWareHouseRequestDTO);
};

export const disabledStoreHouse = (code, params) => request.put(`${base}/${code}/_disable`, params);

export const enabledStoreHouse = (code, params) => request.put(`${base}/${code}/_enable`, params);

export const getStoreHouseLog = (code, params) =>
  request.get(`${base}/${code}/log`, {
    params: { ...params, page: params.page || 1 },
  });

export default 'dummy';
