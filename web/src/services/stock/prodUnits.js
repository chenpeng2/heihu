import request from '../../utils/request';

const baseUrl = 'manufacture/v1';

export async function queryProdUnits(data) {
  return request.post(`${baseUrl}/materialLot/list`, {
    size: data.size || 10,
    page: data.page || 1,
    ...data,
  });
}

export default request;
