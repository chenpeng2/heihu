import request from '../../utils/request';

const baseUrl = 'datagram/v1';

export async function queryProducedMaterial(params) {
  return request.get(`${baseUrl}/scan_hold_records/materials`, {
    params: {
      ...params,
      size: params.size || 1000,
      page: params.page || 1,
    },
  });
}

export default request;
