import request from 'utils/request';

const base = 'def/v1';

export const getWorkDepartmentList = params => request.get(`${base}/work_department/_list`, { params });

export default getWorkDepartmentList;
