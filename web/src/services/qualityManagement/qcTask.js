import request from '../../utils/request';

const defaultSize = 10;
const defaultPage = 1;
const baseUrl = 'quality/v1';

export const queryQcTaskList = async ({ page, size, ...params }) => {
  return request.get(`${baseUrl}/qc_tasks`, {
    params: { page: page || defaultPage, size: size || defaultSize, ...params },
  });
};

export const queryQcMaterial = async ({ id, category }) => {
  return request.get(`${baseUrl}/qc_materials/qc_tasks/${id}`, {
    params: { category: category || 0 },
  });
};

export const queryQcTaskDetail = async code => {
  return request.get(`${baseUrl}/qc_tasks/${code}`, { loading: true });
};

export const updateQcTask = async (id, data) => {
  return request.put(`${baseUrl}/qc_tasks/items/${id}`, data);
};

export const updateQcTaskStatus = async (id, status, description) => {
  return request.put(`${baseUrl}/qc_tasks/${id}/status?status=${status}`, { description }, { loading: true });
};

export const queryQcReport = async id => {
  return request.get(`${baseUrl}/qc_reports/qc_tasks/${id}`);
};

export const queryQcMembersByWorkstation = async workstationId => {
  return request.get(`${baseUrl}/qc_tasks/operator/workstation/${workstationId}`);
};

export const updateQcTaskAttachments = async (id, attachmentIds) => {
  return request.put(`${baseUrl}/qc_tasks/${id}/attachments`, { attachmentIds });
};

export const createQcTask = async data => {
  return request.post(`${baseUrl}/qc_tasks/web_create`, data);
};

export const getQcTaskOperationLog = ({ code, ...params }) => {
  return request.get(`${baseUrl}/qc_tasks/${code}/logs`, { params });
};

export const updateRepeatQcAuditStatus = ({ id, status }) => {
  return request.put(`${baseUrl}/repeat_qc_task_req_config/${id}/status?status=${status}`);
};

export async function getQcTaskListByMaterialLotId(materialLotId) {
  return request.get(`${baseUrl}/qc_tasks/material_lot/${materialLotId}`);
}

// 质检报告批量导出(全部导出)
export const getExportQcTaskDetailList = async params => {
  return request.get(`${baseUrl}/qc_tasks/reports`, { params });
};

// 质检报告批量导出(多选导出)
export const getBulkExportQcTaskDetailList = async params => {
  return request.post(`${baseUrl}/qc_tasks/reports/_bulk`, params);
};

export default 'dummy';
