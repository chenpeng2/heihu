import request from 'utils/request';

const baseUrl = 'manufacture/v1';

export const queryInjectMoldTaskList = params => request.get(`${baseUrl}/inject_mold_task/list`, { params });

export const getInjectMoldTaskDetail = id => request.post(`${baseUrl}/inject_mold_task/${id}/detail`);

export const queryInjectMoldTaskHoldRecords = (taskId, params) =>
  request.get(`${baseUrl}/inject_mold_task/${taskId}/holdRecords`, {
    params: { id: taskId, ...params },
  });

export const queryInjectMoldTaskUseRecords = (taskId, params) => {
  return request.get(`${baseUrl}/inject_mold_task/${taskId}/useRecords`, {
    params: { id: taskId, ...params },
  });
};

export const queryInjectMoldTaskOperationLog = ({ taskId, ...params }) => {
  return request.get(`${baseUrl}/inject_mold_task/${taskId}/histories`, {
    params: { ...params },
  });
};

export default queryInjectMoldTaskList;
