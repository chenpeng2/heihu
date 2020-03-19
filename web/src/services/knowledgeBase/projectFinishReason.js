import request from 'utils/request';

const baseUrl = 'manufacture/v1/project_finish_reason';

export const getProjectFinishReasonList = params => request.get(`${baseUrl}/list`, { params });

export const createProjectFinishReason = data => request.post(`${baseUrl}/create`, data);

export const editProjectFinishReason = data => request.post(`${baseUrl}/updateName`, data);

export const updateProjectFinishReasonStatus = data => request.post(`${baseUrl}/updateStatus`, data);

export default getProjectFinishReasonList;
