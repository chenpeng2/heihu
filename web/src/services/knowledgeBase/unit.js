import request from 'utils/request';

export function units(params) {
  return request.get('def/v1/unit', { params, loadingKey: 'unit' });
}
export function delUnit(id) {
  return request.delete(`def/v1/unit/${id}`);
}

export function addUnit(data) {
  return request.post('def/v1/unit', data);
}
export function unit(id) {
  return request.get(`def/v1/unit/${id}`);
}
export function editUnit(id, data) {
  return request.put(`def/v1/unit/${id}`, data);
}

// 更新单位的状态
export const updateUnitStatus = (id, status) => {
  return request.patch(`def/v1/unit/${id}/status`, { status });
};

export default units;
