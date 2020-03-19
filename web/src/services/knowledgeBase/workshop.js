import request from 'utils/request';

const base = 'def/v1';

export const getWorkshops = params => request.get(`${base}/workshops`, { params });
export const getWorkshop = id => request.get(`${base}/workshops/${id}`);
export const editWorkshop = (id, data) => request.patch(`${base}/workshops/${id}`, data);
export const createWorkshop = data => request.post(`${base}/workshops`, data);
export const checkDisabled = id => request.get(`${base}/workshops/${id}/disabled`);
export const checkEnabled = id => request.get(`${base}/workshops/${id}/enabled`);
export const disabledWorkshop = id => request.put(`${base}/workshops/${id}/disabled`);
export const enabledWorkshop = id => request.put(`${base}/workshops/${id}/enabled`);
export const enabledWorkshopChildren = id => request.put(`${base}/workshops/${id}/enabled/all`);
export const getWorkshopLogs = (id, params) =>
  request.get(`${base}/workshops/${id}/logs`, { params });

export const deleteWorkshop = id => request.delete(`${base}/workshops/${id}`);

export const editWorkshopWorkers = (id, data) => request.put(`${base}/workshops/${id}/workers`, data);

export default getWorkshops;
