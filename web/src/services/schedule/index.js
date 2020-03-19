import request from '../../utils/request';

const defaultSize = 10;
const baseUrl = 'scheduling/v1';

export async function queryWorkOrderProcess({ page, size, ...rest }) {
  return request.get(`${baseUrl}/work_order/_list_process`, {
    params: { page, size: size || defaultSize, ...rest },
  });
}

export async function queryWorkOrderProcessInject({ page, size, ...rest }) {
  return request.get(`${baseUrl}/work_order/_list_process_inject`, {
    params: { page, size: size || defaultSize, ...rest },
  });
}

export async function getLastProcessInject(workOrderCode) {
  return request.get(`${baseUrl}/work_order/${workOrderCode}/last_process_inject`);
}

export async function queryWorkOrderMaterials(code, params) {
  return request.get(`${baseUrl}/work_order/${encodeURIComponent(code)}/display_material`, { params });
}

export async function getTaskDetail(taskCode) {
  return request.get(`${baseUrl}/tasks/${taskCode}`);
}

export async function getInjectTaskDetail(taskCode) {
  return request.get(`${baseUrl}/tasks/${taskCode}/inject_detail`);
}

export async function createTask(data) {
  return request.post(`${baseUrl}/tasks`, data);
}

export async function createInjectTask(data) {
  return request.post(`${baseUrl}/tasks/inject_manual`, data);
}

export async function bulkManualCreateTask(data) {
  return request.post(`${baseUrl}/tasks/_bulk_manual`, data);
}

export async function bulkManualCreateInjectTask(data) {
  return request.post(`${baseUrl}/tasks/bulk_inject_manual`, data);
}

export async function cancelTask(taskCode) {
  return request.put(`${baseUrl}/tasks/${taskCode}/_cancel`);
}

export async function cancelTasks(taskCodes) {
  return request.post(`${baseUrl}/tasks/_bulk_cancel`, taskCodes);
}

export async function cancelInjectTask(taskCode) {
  return request.put(`${baseUrl}/tasks/${taskCode}/_cancel_inject`);
}

export async function lockTask(taskCode) {
  return request.put(`${baseUrl}/tasks/${taskCode}/_lock`);
}

export async function lockTasks(taskCodes) {
  return request.post(`${baseUrl}/tasks/_bulk_lock`, taskCodes);
}

export async function lockInjectTask(taskCode) {
  return request.put(`${baseUrl}/tasks/${encodeURIComponent(taskCode)}/_lock_inject`);
}

export async function unlockTask(taskCode) {
  return request.put(`${baseUrl}/tasks/${taskCode}/_unlock`);
}

export async function unlockTasks(taskCodes) {
  return request.post(`${baseUrl}/tasks/_bulk_unlock`, taskCodes);
}

export async function unlockInjectTask(taskCode) {
  return request.put(`${baseUrl}/tasks/${encodeURIComponent(taskCode)}/_unlock_inject`);
}

export async function createTasks(data) {
  return request.post(`${baseUrl}/tasks/_bulk`, data);
}

export async function distributeTasks(data) {
  return request.put(`${baseUrl}/tasks/_bulk_distribute`, data);
}

export const checkDistributeTasks = codes => request.post(`${baseUrl}/tasks/_distribute_check`, codes);

export const checkInjectDistributeTasks = codes => request.post(`${baseUrl}/tasks/_distribute_inject_check`, codes);

export async function distributeInjectTasks(data) {
  return request.put(`${baseUrl}/tasks/_bulk_distribute_inject`, data);
}

export async function revokeTasks(data) {
  return request.put(`${baseUrl}/tasks/_bulk_revoke`, data);
}

export async function revokeInjectTasks(data) {
  return request.put(`${baseUrl}/tasks/_bulk_revoke_inject`, data);
}

export async function rescheduleTasks(data) {
  return request.post(`${baseUrl}/tasks/_reschedule`, data);
}

export async function auditTasks(data) {
  return request.put(`${baseUrl}/tasks/_batch_audit`, data);
}

export async function queryTimeSlot({ code, seq, body }) {
  return request.post(`${baseUrl}/work_order/${encodeURIComponent(code)}/process/${seq}/timeSlot`, body);
}

export async function queryInjectTimeSlot({ code, body }) {
  return request.post(`${baseUrl}/work_order/${encodeURIComponent(code)}/injectTimeSlot`, body);
}

export async function bulkQueryTimeSlot(params) {
  return request.post(`${baseUrl}/work_order/_bulk_timeslot`, params);
}

export async function queryTask({ size, ...rest }) {
  return request.get(`${baseUrl}/tasks`, {
    params: {
      size: size || defaultSize,
      ...rest,
    },
  });
}

export async function queryInjectTask({ size, ...rest }) {
  return request.get(`${baseUrl}/tasks/list_inject_task`, {
    params: {
      size: size || defaultSize,
      ...rest,
    },
  });
}

export async function getInjectTaskSub(taskCode) {
  return request.get(`${baseUrl}/tasks/${taskCode}/get_inject_sub`);
}

export async function queryAuditTask({ size, ...rest }) {
  return request.get(`${baseUrl}/tasks/need_audit`, {
    params: {
      size: size || defaultSize,
      ...rest,
    },
  });
}

export async function updateTask({ taskCode, ...rest }) {
  return request.patch(`${baseUrl}/tasks/${encodeURIComponent(taskCode)}`, { ...rest });
}

export async function updateInjectTask({ taskCode, ...rest }) {
  return request.patch(`${baseUrl}/tasks/${encodeURIComponent(taskCode)}/inject`, { ...rest });
}

export async function queryTaskListByWorkstations(bodyParams, queryParams) {
  return request.post(`${baseUrl}/tasks/_schedule`, bodyParams, { params: queryParams });
}

export async function queryWorkingCalendar(bodyParams, queryParams) {
  const { startTime, endTime } = queryParams;
  return request.post(`${baseUrl}/calendar?startTime=${startTime}&endTime=${endTime}`, bodyParams);
}

export async function queryWorkOrderProcessDetail({ code, seq }) {
  return request.get(`${baseUrl}/work_order/${encodeURIComponent(code)}/process/${seq}`);
}

export async function queryInjectWorkOrderDetail({ code }) {
  return request.get(`${baseUrl}/work_order/${code}/inject_process`);
}

export async function queryBulkWorkOrderProcessDetail(processes) {
  return request.post(`${baseUrl}/work_order/_bulk_process_detail`, processes);
}

export async function addCapacityCoefficients(params) {
  return request.post(`${baseUrl}/capacity_coefficients`, params);
}

export async function getCapacityCoefficientsList(body, query) {
  return request.post(`${baseUrl}/capacity_coefficients/_list`, body, { params: query });
}

// 排程获取转移申请进度
export async function getMaterialRequest(params) {
  return request.get(`${baseUrl}/material_request`, { params });
}

export function setChartWorkstations(params) {
  return request.put(`${baseUrl}/chart_workstations`, params);
}

export const getScheduleLogs = params => request.get(`${baseUrl}/scheduleLogs`, { params });

export const getScheduleLogDetail = id => request.get(`${baseUrl}/scheduleLogs/${id}`);
export const getDistributeTaskLogs = params => request.get(`${baseUrl}/scheduleLogs`, { params });

export const getDistributeTaskLogDetail = id => request.get(`${baseUrl}/scheduleLogs/${id}`);
export const getRevokeTaskLogs = params => request.get(`${baseUrl}/scheduleLogs`, { params });

export const getRevokeTaskLogDetail = id => request.get(`${baseUrl}/scheduleLogs/${id}`);

export const getAuditLogs = params => request.get(`${baseUrl}/tasks/audit_log`, { params });

export const getWorkOrderTree = code => request.get(`${baseUrl}/work_order/${encodeURIComponent(code)}/tree`);

export function getChartWorkstations(params) {
  return request.get(`${baseUrl}/chart_workstations`, { params });
}

export function checkMouldUnit(params) {
  return request.post(`${baseUrl}/tasks/_check_mould_unit`, params);
}

export const materialRequestProgress = params => {
  return request.get(`${baseUrl}/material_request/_get_request`, { params });
};

export const createTransferApplyDetail = params => {
  return request.get(`${baseUrl}/material_request/_get_overcreate`, { params });
};

export const createTransferApply = data => {
  return request.post(`${baseUrl}/material_request/_over_create`, data);
};

export const getTransactionInfo = data => {
  return request.get('manufacture/v1/transTransaction/getInfo', { data, params: data });
};

export const getDowntimePlanByWorkstationIds = async (workstationIds, params) => {
  return request.post(`${baseUrl}/downtime_plan`, workstationIds, {
    params,
  });
};

export default 'dummy';
