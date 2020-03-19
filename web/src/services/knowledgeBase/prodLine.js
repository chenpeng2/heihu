import request from 'utils/request';

const base = 'def/v1';

export const getProdLines = params => request.get(`${base}/productionLines`, { params });
export const getProdLine = id => request.get(`${base}/productionLines/${id}`);
export const createProdLine = data => request.post(`${base}/productionLines`, data);
export const editProdLine = (id, data) => request.patch(`${base}/productionLines/${id}`, data);
export const checkDisableProdLine = id => request.get(`${base}/productionLines/${id}/disabled`);
export const disableProdLine = id => request.put(`${base}/productionLines/${id}/disabled`);
export const checkEnableProdLine = id => request.get(`${base}/productionLines/${id}/enabled`);
export const enableProdLine = id => request.put(`${base}/productionLines/${id}/enabled`);
export const enableProdLineChildren = id =>
  request.put(`${base}/productionLines/${id}/enabled/all`);
export const getProdLineLogs = (id, params) =>
  request.get(`${base}/productionLines/${id}/logs`, { params });
export const deleteProdLine = id => request.delete(`${base}/productionLines/${id}`);

export const editProdLineWorkers = (id, data) => request.put(`${base}/productionLines/${id}/workers`, data);

export default getProdLines;
