import request from 'utils/request';

const prefix = 'user/v1';

export function getRoles(params) {
  return request(`${prefix}/roles`, { params });
}

export function addRoleUsers(roleId, userIds) {
  return request.post(`${prefix}/roles/${roleId}/users`, { userIds });
}

export function removeUser(roleId, userId) {
  return request.delete(`${prefix}/roles/${roleId}/users/${userId}`);
}

export default getRoles;
