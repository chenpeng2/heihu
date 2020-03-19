import request from 'utils/request';

const baseUrl = 'def/v1';
const typeBase = `${baseUrl}/downtime_reason_type`;
// 停机原因
export const getDownTimeCausesList = async params => {
  return request.get(`${baseUrl}/downtime_reason/_list`, { params });
};

export function addDownTimeCause(data) {
  return request.post(`${baseUrl}/downtime_reason/_add`, data);
}

export function updateDownTimeCause(data) {
  return request.post(`${baseUrl}/downtime_reason/_update/${data.id}`, data);
}

export function disableDownTimeCause(id) {
  return request.post(`${baseUrl}/downtime_reason/_disable/${id}`);
}

export function enableDownTimeCause(id) {
  return request.post(`${baseUrl}/downtime_reason/_enable/${id}`);
}

// 停机原因类型
export const getDowntimeCauseType = params => request.get(`${typeBase}/_list`, { params });

export const addDowntimeCauseType = data => request.post(`${typeBase}`, data);
