import request from 'src/utils/request';

const baseUrl = 'equipment/v1';
const defaultSize = 10;
const defaultPage = 1;

export const getRepairTaskList = async (variables) => {
  const page = variables.page || defaultPage;
  const size = variables.size || defaultSize;

  return request.get(`${baseUrl}/task/repair/_listForWeb`, {
    params: { ...variables, page, size },
  });
};

export function addRepairTask(data) {
  return request.post(`${baseUrl}/task/repair/_addForWeb`, data);
}

export function deleteRepairTask(taskCode) {
  return request.post(`${baseUrl}/task/repair/_deleteForWeb/${taskCode}`);
}

export const getRepairTaskDetail = async taskCode => {
  return request.get(`${baseUrl}/task/repair/_queryDetailForWeb/${taskCode}`);
};

export const getHistoryTaskReport = async variables => {
  return request.get(`${baseUrl}/task/repair/_historyReport/${variables.taskCode}`, {
    params: variables,
  });
};

export const getRepairTaskOverview = async taskCode => {
  return request.get(`${baseUrl}/task/repair/_queryOverviewForWeb/${taskCode}`);
};

export const getRepairLogList = async (taskCode, variables) => {
  const page = variables.page || defaultPage;
  const size = variables.size || defaultSize;

  return request.get(`${baseUrl}/task/repair/_logList/${taskCode}`, {
    params: { ...variables, page, size },
  });
};

export default 'dummy';
