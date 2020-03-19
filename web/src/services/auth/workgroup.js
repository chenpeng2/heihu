import request from 'utils/request';

const prefix = 'user/v1';

export function getWorkgroups(params) {
  return request.get(`${prefix}/workgroups`, { params });
}

export function addWorkgroup(params) {
  return request.post(`${prefix}/workgroups`, params);
}

export function addMembers(groupId, data) {
  return request.post(`${prefix}/workgroups/${groupId}/members`, data);
}

export function editWorkgroup(groupId, data) {
  return request.patch(`${prefix}/workgroups/${groupId}`, data);
}

export function disabledWorkgroup(groupId) {
  return request.delete(`${prefix}/workgroups/${groupId}/enabled`);
}

export function enabledWorkgroup(groupId) {
  return request.put(`${prefix}/workgroups/${groupId}/enabled`);
}

export function removeUser(groupId, userId) {
  return request.delete(`${prefix}/workgroups/${groupId}/members/${userId}`);
}

export function getWorkgroupDetail(groupId) {
  return request.get(`${prefix}/workgroups/${groupId}`);
}

export default getWorkgroups;
