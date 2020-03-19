import request from 'utils/request';

const prefix = 'user/v1';

export function getUsers(params) {
  return request(`${prefix}/users`, { params });
}

export function getUser(id) {
  return request(`${prefix}/users/${id}`);
}

export function addUser(data) {
  return request.post(`${prefix}/users`, data);
}

export function editUser(id, data) {
  return request.patch(`${prefix}/users/${id}`, data);
}

export function disabledUser(id) {
  return request.delete(`${prefix}/users/${id}/enabled`);
}

export function enabledUser(id) {
  return request.put(`${prefix}/users/${id}/enabled`);
}

export function userRecords(params) {
  return request.get(`${prefix}/userRecords`, { params });
}

export function orgInfo() {
  return request.get(`${prefix}/org`);
}

export function getOrgInfoByCode(code) {
  return request.get(`${prefix}/orgs/${code}`);
}

export function userLogin(data) {
  return request.post(`${prefix}/users/_login`, data);
}

export function getUserInfo() {
  return request.get(`${prefix}/user`);
}

export function changeUserPassword(params) {
  return request.post(`${prefix}/users/_changePassword`, params);
}

export const getUserPrivacy = () => request.get(`${prefix}/user/privacy`);

export const setUserPrivacy = () => request.put(`${prefix}/user/privacy`);

export const updateUsersStatus = (data, params) => request.patch(`${prefix}/users`, data, { params });

export default getUsers;
