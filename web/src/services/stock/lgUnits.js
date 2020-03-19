import request from '../../utils/request';

const baseUrl = 'materiallot/v1';
const locationUrl = 'location';

export async function queryLgUnits(data) {
  return request.post(`${baseUrl}/material_lot`, {
    size: data.size || 10,
    page: data.page || 1,
    ...data,
  });
}

export async function queryMaterialDetail({ id, code }) {
  return request.get(`${baseUrl}/material_lot/detail`, {
      params: { id, code },
  });
}

export async function queryStorages(params) {
  return request.get(`${locationUrl}/storages`, {
      params: { ...params },
  });
}

export default request;
