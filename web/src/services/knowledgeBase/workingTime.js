import request from 'src/utils/request';

const baseUrl = 'calendar/v1';

export const getWorkingTimesList = async (params) => {
  return await request.get(`${baseUrl}/operating_hours/list`, { params });
};

export const createWorkingTime = async (params) => {
  return await request.post(`${baseUrl}/operating_hours`, params);
};

export const updateWorkingTimeStatus = async (params) => {
  return await request.put(`${baseUrl}/operating_hours/status`, params);
};

export const getWorkingTimeDetail = async (id) => {
  return await request.get(`${baseUrl}/operating_hours/item`, { params: { id } });
};

export const getWorkingTimeOperationHistory = async (params) => {
  return await request.get(`${baseUrl}/operating_hours/log/list`, { params });
};

export default 'dummy';
