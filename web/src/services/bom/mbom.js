// @flow
import request from '../../utils/request';

const defaultPage = 1;
const defaultSize = 10;
const baseUrl = '/def/v1';

export const getMboms = (params: any): any => {
  return request.get('/def/v1/mbom', {
    params,
  });
};

export const getMbom = (params: any): any => {
  return request.get('/def/v1/mbom/material_code_version', {
    params,
  });
};

export const getBasicMbomInfo = async (params: { code: string, version: string }): any => {
  return request.get(`${baseUrl}/mbom/_get_mbom_basic_info`, { params });
};

export const getMbomByMaterialCodeAndVersion = (params: { code: string, version: string }): any => {
  return request.get('/def/v1/mbom/_get', {
    params,
  });
};

export const getMBomById = (id: string): any => {
  return request.get(`/def/v1/mbom/${id}`);
};

export const getMBomByIdForSop = id => request.get(`/def/v1/mbom/get_for_sop/${id}`);

export const getMBomOperationLogs = (params: any): any => {
  const { page, size, id, ...rest } = params;
  return request.get(`${baseUrl}/mbom_operation_log/${id}`, {
    params: { page, size: size || defaultSize, ...rest },
  });
};

export const addMBom = (data: any): any => {
  return request.post(`${baseUrl}/mbom`, data);
};

export const editMBom = (data: any): any => {
  return request.put(`${baseUrl}/mbom/${data.id}`, data);
};

export const updateMBomStatus = ({ id, status }: { id: string, status: number }): any => {
  return request.put(`${baseUrl}/mbom/${id}/status`, { id, status });
};

export const bulkUpdateMBomStatus = ({ ids, status }: { ids: [string], status: number }): any => {
  return request.put(`${baseUrl}/mbom/items/_bulk/status`, { ids, status });
};

export const getMbomByProcessRouting = (processRoutingCode: any): any => {
  return request.get(`${baseUrl}/mbom/process_routing/${processRoutingCode}`);
};

export const importMboms = (data: any): any => {
  return request.post(`${baseUrl}/mbom/_import`, data);
};

export const getMbomImportLogs = ({ page, size, fromAt, toAt }: any): any => {
  return request.get(`${baseUrl}/mbom_import_log`, {
    params: { page: page || defaultPage, size: size || defaultSize, fromAt, toAt },
  });
};

export const getMbomImportLogDetail = (id: any, params: any): any => {
  return request.get(`${baseUrl}/mbom_import_log/${id}`, {
    params,
  });
};

export const syncAllQcConfigsByProcessRouting = processRoutingCode =>
  request.put(`${baseUrl}/mbom_node/process_routing/${processRoutingCode}/_qc_sync_all`);

export const syncQcConfigsByProcessRouting = ({ processRoutingCode, mBomIds }) =>
  request.put(`${baseUrl}/mbom_node/process_routing/${processRoutingCode}/_qc_sync`, mBomIds);

export default 'dummy';
