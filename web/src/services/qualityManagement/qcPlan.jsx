import request from '../../utils/request';

const defaultSize = 10;
const defaultPage = 1;
const baseUrl = 'quality/v1';

export const queryQcPlanList = async ({ page, size, ...params }) => {
  return request.get(`${baseUrl}/qc_plans`, {
    params: { page: page || defaultPage, size: size || defaultSize, ...params },
    loading: true,
  });
};

export const createQcPlan = data => {
  return request.post(`${baseUrl}/qc_plans`, data, { loading: true });
};

export const updateQcPlanStatus = ({ code, status }) => {
  return request.put(`${baseUrl}/qc_plans/${code}/status?status=${status}`, {}, { loading: true });
};

/** 普通/注塑计划工单详情 */
export const queryQcPlanDetail = code => {
  return request.get(`${baseUrl}/qc_plans/${code}`, { loading: true });
};

export const editQcPlan = ({ code, ...data }) => {
  return request.put(`${baseUrl}/qc_plans/${code}`, data, { loading: true });
};

export const editQcPlanProcess = ({ id: qcPlanProcessId, ...data }) => {
  return request.put(`${baseUrl}/qc_plan_process/${qcPlanProcessId}`, data, { loading: true });
};

export default 'dummy';
