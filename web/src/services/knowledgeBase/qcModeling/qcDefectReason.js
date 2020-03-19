import request from 'src/utils/request';

const baseUrl = 'quality/v1';

// 不良原因

export async function getQcDefectReasonList(params) {
  return request.get(`${baseUrl}/qc_defect_reason/_list`, { params });
}

export async function getQcDefectReasonDetail(id) {
  return request.get(`${baseUrl}/qc_defect_reason/${id}`);
}

export async function createQcDefectReason(params) {
  return request.post(`${baseUrl}/qc_defect_reason/`, params);
}

export async function updateQcDefectReason(id, params) {
  return request.put(`${baseUrl}/qc_defect_reason/${id}`, params);
}

export async function disabledQcDefectReason(id) {
  return request.put(`${baseUrl}/qc_defect_reason/_disable/${id}`);
}

export async function enabledQcDefectReason(id) {
  return request.put(`${baseUrl}/qc_defect_reason/_enable/${id}`);
}

export async function importQcDefectReason(params) {
  return request.post(`${baseUrl}/qc_defect_reason/_import`, params);
}

export async function getQcDefectReasonImportList(params) {
  return request.get(`${baseUrl}/qc_defect_reason/_list_import_log`, { params });
}

export async function getQcDefectReasonImportLogDetail(params) {
  return request.get(`${baseUrl}/qc_defect_reason/_get_import_log`, { params });
}

export async function getQcDefectReasonImportLogErrorList(params) {
  return request.get(`${baseUrl}/qc_defect_reason/_get_import_log/detail`, { params });
}
