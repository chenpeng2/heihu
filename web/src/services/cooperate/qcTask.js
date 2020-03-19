import request from '../../utils/request';

const defaultSize = 10;
const baseUrl = 'quality/v1';

export async function getQcTasks(params) {
  return request.get(`${baseUrl}/qc_tasks`, {
    params: { ...params },
  });
}

export async function getQcTasksByProjectCodes(body, query) {
  return request.post(`${baseUrl}/qc_tasks/query_condition/_bulk`, body, {
    params: { ...query, page: query.page || 1, size: query.size || defaultSize },
  });
}

export async function updateQcTask(code, params) {
  return request.put(`${baseUrl}/qc_tasks/items/${encodeURIComponent(code)}`, {
    ...params,
  });
}

export async function getMaterialQcData(materialId, params) {
  return request.get(`${baseUrl}/qc_tasks/material_lot/${materialId}/branch_tree`, params);
}

export default 'dummy';
