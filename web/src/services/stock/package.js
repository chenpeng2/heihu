import request from '../../utils/request';

const defaultSize = 10;
const defaultPage = 1;
const baseUrl = 'materialLot/v1';

export async function queryPackageRecordList({ page, size, ...rest }) {
  return request.get(`${baseUrl}/package_record`, {
    params: { page: page || defaultPage, size: size || defaultSize, ...rest },
  });
}

export async function queryPackageRecordDetail(id) {
  return request.get(`${baseUrl}/package_record/${id}`);
}

export async function queryPackageList({ page, size, ...rest }) {
  return request.post(`${baseUrl}/material_lot_package`, {
    page: page || defaultPage,
    size: size || defaultSize,
    ...rest,
  });
}

export async function queryPackageDetail(params) {
  return request.get(`${baseUrl}/material_lot_package/detail`, {
    params,
  });
}

export default 'dummy';
