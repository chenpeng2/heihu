import request from '../../utils/request';

const baseUrl = 'datagram/v1';

export async function queryProductionCapacity(data) {
  return request.post(`${baseUrl}/workstation_capacity_records/datagram?size=${data.size || 10}&page=${data.page || 1}`, data);
}

export default request;
