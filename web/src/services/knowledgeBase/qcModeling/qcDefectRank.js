import request from 'src/utils/request';

const baseUrl = 'quality/v1';

// 不良等级

export async function getQcDefectRankList(params) {
  return request.get(`${baseUrl}/qc_defect_rank/_list`, { params });
}

export async function getQcDefectRankDetail(id) {
  return request.get(`${baseUrl}/qc_defect_rank/${id}`);
}

export async function createQcDefectRank(parmas) {
  return request.post(`${baseUrl}/qc_defect_rank/`, parmas);
}

export async function updateQcDefectRank(id, parmas) {
  return request.put(`${baseUrl}/qc_defect_rank/${id}`, parmas);
}

export async function disabledQcDefectRank(id) {
  return request.put(`${baseUrl}/qc_defect_rank/_disable/${id}`);
}

export async function enabledQcDefectRank(id) {
  return request.put(`${baseUrl}/qc_defect_rank/_enable/${id}`);
}

export async function importQcDefectRank(parmas) {
  return request.post(`${baseUrl}/qc_defect_rank/_import`, parmas);
}

export async function getQcDefectRankImportList(parmas) {
  return request.get(`${baseUrl}/qc_defect_rank/_list_import_log`, { parmas });
}

export async function getQcDefectRankImportLogDetail(params) {
  return request.get(`${baseUrl}/qc_defect_rank/_get_import_log`, { params });
}

export async function getQcDefectRankImportLogErrorList(params) {
  return request.get(`${baseUrl}/qc_defect_rank/_get_import_log/detail`, { params });
}
