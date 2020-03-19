import request from 'src/utils/request';

const baseUrl = 'equipment/v1';
const defaultSize = 10;
const defaultPage = 1;

export const getMaintenanceTaskList = async (variables) => {
  const page = variables.page || defaultPage;
  const size = variables.size || defaultSize;

  return request.get(`${baseUrl}/strategy/task/_list`, {
    params: { ...variables, page, size },
  });
};

export const getMaintainTaskOverview = async taskCode => {
  return request.get(`${baseUrl}/task/maintain/_queryOverviewForWeb/${taskCode}`);
};

export const getMaintainLogList = async (taskCode, variables) => {
  const page = variables.page || defaultPage;
  const size = variables.size || defaultSize;

  return request.get(`${baseUrl}/strategy/task/_logList/${taskCode}`, {
    params: { ...variables, page, size },
  });
};

export const getMaintenanceTaskDetail = async taskCode => {
  return request.get(`${baseUrl}/strategy/task/_queryDetail/${taskCode}`);
};

export const getHistoryTaskReport = async variables => {
  return request.get(`${baseUrl}/strategy/task/_currentReport/${variables.taskCode}`, {
    params: variables,
  });
};

export default 'dummy';
