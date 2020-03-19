import request from 'src/utils/request';

const baseUrl = 'calendar/v1/produce_calendar';

export const getWorkingCalendarList = async params => {
  return await request.get(`${baseUrl}/list`, { params });
};

export const createWorkingCalendar = async params => {
  return await request.post(`${baseUrl}`, params);
};

export const editWorkingCalendar = async params => {
  return await request.post(`${baseUrl}/update`, params);
};

export const updateWorkingCalendarStatus = async params => {
  return await request.put(`${baseUrl}/status`, params);
};

export const getWorkingCalendarDetail = async id => {
  return await request.get(`${baseUrl}/${id}`);
};

export const getWorkingCalendarOperationHistory = async params => {
  return await request.get(`${baseUrl}/log/list`, { params });
};

export const getWorkingCalendarByWorkstationIds = async params => {
  const { workstationIds, year, ...rest } = params || {};
  return await request.post(`${baseUrl}/items${year !== undefined ? `?year=${year}` : ''}`, { workstationIds, ...rest });
};

export default 'dummy';
