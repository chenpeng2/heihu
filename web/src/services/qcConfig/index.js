import request from '../../utils/request';

const defaultSize = 10;
const baseUrl = 'quality/v1';

export async function getQcConfigByIds(params) {
  return request.post(`${baseUrl}/qc_config/_bulk_get`, params);
}

export async function createQcConfig(params) {
  return request.post(`${baseUrl}/qc_config/_create`, params);
}

export async function applyQcConfig(params) {
  return request.post(`${baseUrl}/qc_config/_apply/${params.id}`, params);
}

export async function syncQcConfig(params) {
  return request.post(`${baseUrl}/qc_config/_sync/${params.id}`, params);
}

export async function editQcConfig(params) {
  return request.put(`${baseUrl}/qc_config/_update/${params.id}`, params);
}

export async function updateQcConfigState(id, params) {
  return request.put(`${baseUrl}/qc_config/${id}/state?state=${params.state}`);
}

export async function getQcConfigList(params) {
  return request.get(`${baseUrl}/qc_config/_list`, {
    params: { size: defaultSize, ...params },
  });
}

export async function getQcConfigDetail({ id, ...rest }) {
  return request.get(`${baseUrl}/qc_config/_get/${id}`, {
    params: { id, ...rest },
  });
}

export async function getQcConfigOperationLog({ id, ...rest }) {
  return request.get(`${baseUrl}/qc_config/operation_log/${id}`, {
    params: { id, ...rest },
  });
}

export async function getQcAql() {
  return request.get(`${baseUrl}/qc_aql`);
}

export async function getQcAqlInspections() {
  return request.get(`${baseUrl}/qc_aql/inspections`);
}

export const getQcTaskBySearch = params => request.get(`${baseUrl}/qc_config/qc_tasks/_list`, { params });

export async function createAndUpdateMaterialQcConfig(params) {
  return request.post(`${baseUrl}/qc_config/_create_and_update_material_qc`, params);
}

export async function createAndUpdateMbomQcConfig(params) {
  return request.post(`${baseUrl}/qc_config/_create_and_update_m_bom_qc`, params);
}

export async function createAndUpdateProcessQcConfig(params) {
  return request.post(`${baseUrl}/qc_config/_create_and_update_process_routing_qc`, params);
}

export async function importQcConfigBase(params) {
  return request.post(`${baseUrl}/qc_config/base/_import`, params);
}

export async function importQcConfigMaterial(params) {
  return request.post(`${baseUrl}/qc_config/material/_import`, params);
}

export async function importQcConfigCheckItemConfig(params) {
  return request.post(`${baseUrl}/qc_config/checkItemConfig/_import`, params);
}

export async function getQcConfigImportList(params) {
  return request.get(`${baseUrl}/qc_config/_list_import_log`, { params });
}

export async function getQcConfigImportLogDetail(params) {
  return request.get(`${baseUrl}/qc_config/_get_import_log`, { params });
}

export async function getQcConfigImportLogErrorList(params) {
  return request.get(`${baseUrl}/qc_config/_get_import_log/detail`, { params });
}

export default 'dummy';
