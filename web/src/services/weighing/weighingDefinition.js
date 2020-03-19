import request from '../../utils/request';

const baseUrl = 'weighing/v1/weighing';

export const queryWeighingDefinitionList = async params => {
  return request.get(`${baseUrl}/list_weighing`, {
    params,
  });
};

export const createWeighingDefinition = async data => {
  return request.post(`${baseUrl}`, data);
};

export const editWeighingDefinition = async (id, data) => {
  return request.put(`${baseUrl}/${id}/update`, data);
};

export const queryWeighingDefinitionDetail = async (id, params) => {
  return request.get(`${baseUrl}/${id}`, {
    params,
  });
};

export const updateWeighingDefinitionStatus = async (id, action) => {
  return request.put(`${baseUrl}/${id}/${action}`);
};

export const importWeighingDefinition = async data => {
  return request.post(`${baseUrl}/weighing_bulk`, data);
};

export const queryWeighingDefinitionImportLogs = async params => {
  return request.get(`${baseUrl}/import_log`, { params });
};

export const queryWeighingDefinitionImportDetail = async importId => {
  return request.get(`${baseUrl}/${importId}/_detail`);
};

export default request;
