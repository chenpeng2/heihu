// @flow
import request from '../../utils/request';

const baseUrl = 'manufacture/v1';
const INJECT_MOLD = 'inject_mold_project';
const urlList = {
  getProject: 'project',
  getProjects: 'project/list',
  getProjectProcesses: 'project_processes',
  getProjectProcessItems: 'project_processes/items',
  createProject: 'project',
  editProject: 'project/update',
  history: 'project/history',
  updateStatus: 'project',
  importProjects: 'project/bulk',
  procureMaterials: 'project/procure_materials',
  getPurchaseProgress: 'project/project_procure',
  getProjectReportList: 'datagram/v1/project_progress/project_report',
  getPurchaseProject: 'project/project_code',
  getProjectsByProjectCodes: 'project/bulk_get',
  createProjectBatchRecordAudit: 'project/batch_audit/_create',
  auditProjectBatchRecord: 'project/batch_audit/_do_audit',
  getProjectBatchRecordAuditDetail: 'project/batch_audit/_get_detail',
  getProjectBatchRecordAuditStatus: 'project/batch_audit/_get_status',
  getProjectBatchRecordUrl: 'project/batch_audit/_get_batch_url',
};

export const getProjectList = async (params: {}): any => {
  return request.get(`${baseUrl}/${urlList.getProjects}`, {
    params,
  });
};
// 注塑项目
export const getInjectMoldProject = params => request.get(`${baseUrl}/${INJECT_MOLD}/list`, { params });

// 注塑项目详情
export const getInjectMoldProjectDetail = params => request.get(`${baseUrl}/${INJECT_MOLD}/detail`, { params });

export const getProjectReportList = async (params: {}): any => {
  return request.get(`${urlList.getProjectReportList}`, {
    params,
  });
};

export const getProject = async (params: { code: string }): any => {
  const { code } = params;
  return request.get(`${baseUrl}/${urlList.getProject}/${encodeURIComponent(code)}`);
};

export const getProjectProcesses = async (params: {
  projectCode: string,
  page: number,
  size: number,
  processCode: string,
}): any => {
  return request.get(`manufacture/v1/${urlList.getProjectProcesses}`, { params });
};

export const getProjectProcessItems = async (params: {
  projectCode: string,
  page: number,
  size: number,
  processCode: string,
  statuses: string,
}): any => {
  return request.get(`manufacture/v1/${urlList.getProjectProcessItems}`, { params });
};

export const createProject = async (params: any): any => {
  return request.post(`${baseUrl}/${urlList.createProject}`, params);
};

export const editProject = async (params: any): any => {
  return request.put(`${baseUrl}/${urlList.editProject}`, params);
};

export const getProjectOperationHistory = async (params: {
  code: string,
  startTime: string,
  endTime: string,
  page: number,
  size: number,
}): any => {
  const { code, ...rest } = params;
  return request.get(`${baseUrl}/${urlList.history}/${encodeURIComponent(code)}`, { params: rest });
};

export const updateProjectStatus = async (params: { code: string }): any => {
  const { code, ...rest } = params;
  return request.put(`${baseUrl}/${urlList.updateStatus}/${encodeURIComponent(code)}/status`, { ...rest });
};

// 更新注塑项目状态

export const updateInjectMoldProjectStatus = ({ code, ...rest }) =>
  request.put(`${baseUrl}/${INJECT_MOLD}/${code}/status`, { ...rest }, { params: { code } });

export const importProjects = async (params: any): any => {
  return request.post(`${baseUrl}/${urlList.importProjects}`, { ...params });
};

export const importProjectList = async (params: any): any => {
  return request.get(`${baseUrl}/${urlList.importProjects}`, { params });
};

export const importProjectDetail = async (id: string, params: any): any => {
  return request.get(`${baseUrl}/${urlList.importProjects}/detail/${encodeURIComponent(id)}`, { ...params });
};

export const getProjectProcureMaterial = async (params: {
  projectCode: string,
  purchaseOrderCode: string,
  filterByProjectStatus: boolean,
}): any => {
  return request.get(`${baseUrl}/${urlList.procureMaterials}`, { params: { ...params, filterByProjectStatus: true } });
};

export const getPurchaseProgress = async (params: any): any => {
  return request.get(`${baseUrl}/${urlList.getPurchaseProgress}`, { params });
};

export const getPurchaseProject = async (params: any): any => {
  return request.get(`${baseUrl}/${urlList.getPurchaseProject}`, {
    params: { ...params, filterByProjectStatus: true },
  });
};

export const getProjectsByProjectCodes = async (params: any): any => {
  return request.post(`${baseUrl}/${urlList.getProjectsByProjectCodes}`, params);
};

// 取消项目校验
export const cancelProjectVerify = (code: string): any => {
  return request.put(`${baseUrl}/project/verify_project_abort/${encodeURIComponent(code)}`);
};

// 查询项目中某种物料计划的需求量
export const getMaterialAmountAccordingFatherProject = (params: { materialCode: string, projectCode: string }): any => {
  return request.get(`${baseUrl}/project_processes/inputMaterialPlannedAmount`, { params });
};

// 查询项目的子项目
export const getSubProjects = (params: { parentCode: string, materialCode: string }): any => {
  return request.get(`${baseUrl}/project/subProject/`, { params });
};

// 更新项目的批次号规则
export const updateProjectProductBatchCodeRule = (projectCode: string, ruleId: string): any => {
  return request.put(
    `${baseUrl}/project/${encodeURIComponent(projectCode)}/updateProductBatchNumberRule?ruleId=${encodeURIComponent(
      ruleId,
    )}`,
  );
};

// 批量开始结束项目
export const bulkStartProject = (params: any) => request.post(`${baseUrl}/project/bulkStart`, params);
export const bulkFinishProject = (params: any) => request.post(`${baseUrl}/project/bulkFinish`, params);

export const getProjectLevelTree = (code: string) => request.get(`${baseUrl}/project/${encodeURIComponent(code)}/tree`);

// SOP项目 批记录审批
export const createProjectBatchRecordAudit = params =>
  request.post(`${baseUrl}/${urlList.createProjectBatchRecordAudit}`, params);

export const getProjectBatchRecordAuditDetail = ({ projectCode, ...params }) =>
  request.post(
    `${baseUrl}/${urlList.getProjectBatchRecordAuditDetail}?projectCode=${encodeURIComponent(projectCode)}`,
    params,
  );

export const auditProjectBatchRecord = ({ id, status, remark, ...rest }) =>
  request.put(`${baseUrl}/${urlList.auditProjectBatchRecord}/${id}`, { ...rest }, { params: { status, remark } });

export const getProjectBatchRecordAuditStatus = ({ projectCode, ...params }) =>
  request.get(`${baseUrl}/${urlList.getProjectBatchRecordAuditStatus}?projectCode=${encodeURIComponent(projectCode)}`, {
    params,
  });

export const getProjectBatchRecordUrl = projectCode =>
  request.get(`${baseUrl}/${urlList.getProjectBatchRecordUrl}?projectCode=${encodeURIComponent(projectCode)}`);

export default 'dummy';
