import request from 'utils/request';

const baseUrl = 'scheduling/v1';

export function getPreparationTimeList(params) {
  return request.get(`${baseUrl}/preparation_time`, { params });
}
export function getPreparationTimeDetail({ id, ...rest }) {
  return request.get(`${baseUrl}/preparation_time/${id}`, { ...rest });
}
export function createPreparationTime(body) {
  return request.post(`${baseUrl}/preparation_time`, body);
}

export function updatePreparationTime({ id, ...rest }) {
  return request.patch(`${baseUrl}/preparation_time/${id}`, { id, ...rest });
}

export default 'dummy';
