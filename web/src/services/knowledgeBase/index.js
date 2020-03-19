import request from 'utils/request';

export function getWorkStationGroup() {
  return request.get('/def/v1/workstation_group');
}

export async function queryCapacityItem(params) {
  return request.post('def/v1/capacity/capacity_item', params);
}

export default request;
