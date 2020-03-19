import request from 'src/utils/request';

const baseUrl = 'quality/v1';
const defaultSize = 10;
const defaultPage = 1;

// 质检分类
export async function queryQcItemsGroupList({ page, size, ...params }) {
  return request.get(`${baseUrl}/qc_check_item_group/_list`, {
    params: { page: page || defaultPage, size: size || defaultSize, ...params },
  });
}

export async function createQcItemsGroup(data) {
  return request.post(`${baseUrl}/qc_check_item_group/_create`, data);
}

export async function deleteQcItemsGroup(id) {
  return request.delete(`${baseUrl}/qc_check_item_group/_delete/${id}`);
}

export async function updateQcItemsGroup(id, data) {
  return request.put(`${baseUrl}/qc_check_item_group/_update/${id}`, data);
}

export async function queryQcItemsGroupDetail(id) {
  return request.get(`${baseUrl}/qc_check_item_group/_get/${id}`);
}

// 质检项
export async function queryQcItemsList({ page, size, ...params }) {
  return request.get(`${baseUrl}/qc_check_item/_list`, {
    params: { page: page || defaultPage, size: size || defaultSize, ...params },
  });
}

export async function importQcItems(data) {
  return request.post(`${baseUrl}/qc_check_item/_import`, data);
}

export async function createQcItem(data) {
  return request.post(`${baseUrl}/qc_check_item/_create`, data);
}

export async function deleteQcItem(id) {
  return request.delete(`${baseUrl}/qc_check_item/_delete/${id}`);
}

export async function updateQcItem(id, data) {
  return request.put(`${baseUrl}/qc_check_item/_update/${id}`, data);
}

export async function queryQcItemDetail(id) {
  return request.get(`${baseUrl}/qc_check_item/_get/${id}`);
}

export async function queryQcItemOperationLogs({ id, page, size, ...params }) {
  return request.get(`${baseUrl}/qc_check_item/operation_log/${id}`, {
    params: { page: page || defaultPage, size: size || defaultSize, ...params },
  });
}

export async function queryQcItemImportLogDetail(params) {
  return request.get(`${baseUrl}/qc_check_item/_get_import_log`, { params });
}

export async function queryQcItemImportLogErrorList(params) {
  return request.get(`${baseUrl}/qc_check_item/_get_import_log/detail`, { params });
}

export async function queryQcItemsImportLogs({ page, size, ...params }) {
  return request.get(`${baseUrl}/qc_check_item/_list_import_log`, {
    params: { page: page || defaultPage, size: size || defaultSize, ...params },
  });
}

export default 'dummy';
