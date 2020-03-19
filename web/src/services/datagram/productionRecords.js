import request from '../../utils/request';

const baseUrl = 'datagram/v1';

export async function queryCurrentProduction(data) {
  return request.post(`${baseUrl}/date_production_records?size=${data.size || 10}&page=${data.page || 1}`, data);
}

export async function queryHistoricProduction(data) {
  return request.post(`${baseUrl}/history_production_records?size=${data.size || 10}&page=${data.page || 1}`, data);
}

export const queryProduction = data =>
  request.post(`${baseUrl}/production_records?size=${data.size || 10}&page=${data.page || 1}`, data);

export const getProductionWorkTimeRecords = (params, data) =>
  request.post(`${baseUrl}/production_work_time_records`, data, { params });

export const getProjectWorkTime = (projectCode, processCode, processSeq, params) =>
  request.get(
    `${baseUrl}/production_work_time_records/project/${projectCode}/process/${processCode}/seq/${processSeq}`,
    { params },
  );

export const getAllProjectWorkTime = (params, data) =>
  request.post(`${baseUrl}/production_work_time_records/project/items`, data, { params });

// 次品报表

export const getProductionDefectReportList = (params, data) =>
  request.post(`${baseUrl}/date_defect_report/list`, data, { params });

export const getProductionDefectReportGram = data => request.post(`${baseUrl}/date_defect_report/gram`, data);

export default request;
