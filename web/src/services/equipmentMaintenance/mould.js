import request from 'utils/request';

const baseUrl = 'equipment/v1';

export function getMouldList(params) {
  return request(`${baseUrl}/mould/_list`, { params });
}

export function addMould(data) {
  return request.post(`${baseUrl}/mould/_add`, data);
}

export function getMouldDetail(id) {
  return request.get(`${baseUrl}/mould/_detailForWeb/${id}`);
}

export function updateMould(id, data) {
  return request.post(`${baseUrl}/mould/_update/${id}`, data);
}

export function getMouldLog(id, params) {
  return request(`${baseUrl}/mould/_logList/${id}`, { params });
}

export function enableMould(id) {
  return request.post(`${baseUrl}/mould/_enable/${id}`);
}

export function disableMould(id, reason) {
  return request.post(`${baseUrl}/mould/_disable/${id}?reason=${reason}`);
}

export function scrapMould(id) {
  return request.post(`${baseUrl}/mould/_scrap/${id}`);
}

export function editMouldCode(id, code) {
  return request.post(`${baseUrl}/mould/_changeCode/${id}?code=${encodeURIComponent(code)}`);
}

export default getMouldList;
