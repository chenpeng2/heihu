import request from '../../utils/request';

const defaultSize = 10;
const baseUrl = 'def/v1';
export async function queryProcessOperation({ code, page, size, fromAt, toAt }) {
  return request.get(`${baseUrl}/process_operation_log/${encodeURIComponent(code)}`, {
    params: { page: page || 0, size: size || defaultSize, fromAt, toAt },
  });
}
export async function queryProcess(params) {
  return request.get(`${baseUrl}/process`, { params });
}

export async function getProcessByCodes(params) {
  return request.post(`${baseUrl}/process/items`, params);
}

export async function getProcessCode() {
  return request.post(`${baseUrl}/process/codes`);
}

// 获取工序的详情
export const getProcessDetail = async code => {
  if (!code) return null;

  return request.get(`${baseUrl}/process/${encodeURIComponent(code)}`);
};

// 更新工序的启用状态
export const updateProcessStatus = async (code, status) => {
  return request.put(`${baseUrl}/process/${encodeURIComponent(code)}/status`, { status });
};

// 创建工序
export const createProcess = params => {
  return request.post(`${baseUrl}/processes`, params);
};

// 更新工序
export const updateProcess = (code, params) => {
  return request.put(`${baseUrl}/process/${encodeURIComponent(code)}`, params);
};

// 导入工序
export const importProcess = data => {
  return request.post(`${baseUrl}/processes/_import`, data);
};

// 工序导入日志列表
export const queryProcessImportLogs = params => {
  return request.get(`${baseUrl}/process_import_log`, { params });
};

// 工序导入日志详情
export const queryProcessImportLogDetail = id => {
  return request.get(`${baseUrl}/process_detail_log/${id}`);
};

// 工序的操作记录
export const getProcessOperationHistory = (code, params) => {
  return request.get(`${baseUrl}/process_operation_log/${encodeURIComponent(code)}`, { params });
};

export const syncProcessWorkstations = ({ processCode, ...rest }) => {
  return request.post(`${baseUrl}/processes/sync_workstation`, {
    processCode: encodeURIComponent(processCode),
    ...rest,
  });
};

// 同步工序改动附件到工艺路线和mbom
export const syncProcessAttachments = data => {
  if (!data) return;
  const { processCode } = data || {};
  return request.put(`${baseUrl}/process/${encodeURIComponent(processCode)}/_sync/attachments`, data);
};

// 同步工序改动任务下发审批
export const syncProcessDeliverable = data => {
  if (!data) return;
  const { processCode, deliverable } = data || {};
  return request.put(
    `${baseUrl}/process/${encodeURIComponent(processCode)}/sync_deliverable?deliverable=${deliverable}`,
    data,
  );
};

// 电子批记录模板

export const getBatchTemplateList = params => request.get(`${baseUrl}/batch_templates`, { params });

export const createBatchTemplate = data => request.post(`${baseUrl}/batch_templates`, data);

export const getBatchTemplateDetail = id => request.get(`${baseUrl}/batch_templates/${id}`);

export const editBatchTemplates = (id, data) => request.put(`${baseUrl}/batch_templates/${id}`, data);

export const getBatchTemplateByName = name => request.get(`${baseUrl}/batch_templates/name`, { params: { name } });

export default 'dummy';
