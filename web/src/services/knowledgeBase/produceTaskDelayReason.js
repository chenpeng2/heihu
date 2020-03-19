import request from 'utils/request';

const baseUrl = 'def/v1/produce_task_delay_reasons';

export const getProduceTaskDelayReasonList = params => request.get(`${baseUrl}`, { params });

export const createProduceTaskDelayReason = data => request.post(`${baseUrl}`, data);

export const editProduceTaskDelayReason = data => request.put(`${baseUrl}/${data && data.id}`, data);

export const updateProduceTaskDelayReasonStatus = ({ id, status }) => request.put(`${baseUrl}/${id}/status`, { status });

export default 'dummy';
