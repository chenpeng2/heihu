import request from 'src/utils/request';

const baseUrl = 'event/v1/events';

export const getEventList = async (params) => {
  return await request.get(`${baseUrl}/items`, { params });
};

export const deleteEvent = async (id) => {
  return await request.delete(`${baseUrl}/${id}`);
};

export const updateEventStatus = async (id, params) => {
  return await request.put(`${baseUrl}/${id}/status`, params);
};

export default 'dummy';
