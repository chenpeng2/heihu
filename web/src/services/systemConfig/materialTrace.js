import request from 'utils/request';

const baseURL = 'history_trace/v1/material';

export const getMaterialTraceList = (params, data) =>
  request.post(`${baseURL}/list`, data, { params });

export const getAllMaterials = (materialLotId) => request.get(`${baseURL}/${materialLotId}`);

export default getMaterialTraceList;
