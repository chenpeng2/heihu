import request from '../../utils/request';

const baseUrl = 'weighing/v1/weighing';

export const queryWeighingTaskList = async params => {
  return request.get(`${baseUrl}/list_task`, {
    params,
  });
};

export const queryWeighingTaskByProject = async ({ projectCode, ...params }) => {
  return request.get(`${baseUrl}/list_task_by_project?projectCode=${encodeURIComponent(projectCode)}`, {
    params,
  });
};

export const genWeighingInstructions = async params => {
  return request.post(`${baseUrl}/gen_instructions`, params);
};

export const createWeighingTask = async data => {
  return request.post(`${baseUrl}/task`, data);
};

export const editWeighingTask = async (id, data) => {
  return request.put(`${baseUrl}/${id}/task`, data);
};

export const queryWeighingTaskDetail = async ({ id, ...params }) => {
  return request.get(`${baseUrl}/${id}/task`, {
    params,
  });
};

export const cancelWeighingTask = async id => {
  return request.put(`${baseUrl}_task/${id}/abort_task`);
};

export const queryWeighingTaskLog = async ({ id, ...params }) => {
  return request.get(`${baseUrl}_task/${id}/log`, {
    params,
  });
};

export const queryWeighingRecord = async taskId => {
  return request.get(`${baseUrl}_task/${taskId}/list_weighing_record`);
};

export const queryWeighingRecordBulk = async ({ ids, ...params }) => {
  return request.post(`${baseUrl}_task/list_record`, ids);
};

export const queryWeighingLeftRecord = async taskId => {
  return request.get(`${baseUrl}_task/${taskId}/remaining_weighing_list`);
};
export default request;
