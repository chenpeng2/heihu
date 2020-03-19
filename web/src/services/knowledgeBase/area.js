import request from 'utils/request';

const base = 'def/v1';

export const getAreaList = params => request.get(`${base}/areas/organization`, { params });
export const getWorkShopChildren = (id, params) =>
  request.get(`${base}/areas/workshop/${id}`, { params });
export const getProdLineChildren = (id, params) =>
  request.get(`${base}/areas/productionLine/${id}`, { params });
export const getDisabledAreaList = params => request.get(`${base}/areas/disabled`, { params });

export default getAreaList;
