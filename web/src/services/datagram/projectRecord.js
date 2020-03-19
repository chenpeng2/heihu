import request from 'utils/request';

const baseUrl = 'datagram/v1';

export const getProjectUseMaterialRecord = (params, data) =>
  request.post(`${baseUrl}/project_use_material_records`, data, { params });

export const getProduceTaskUseMaterialRecord = (projectCode, params) =>
  request.get(`${baseUrl}/produce_task_use_material_records/project/${projectCode}`, { params });

export default getProjectUseMaterialRecord;
