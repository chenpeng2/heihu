import qs from 'qs';

// 质量管理
export const QUALITY_MANAGEMENT_BASE_URL = '/qualityManagement';
// 质检任务
export const QCTASK_BASE_URL = `${QUALITY_MANAGEMENT_BASE_URL}/qcTask`;
// 质检任务审核
export const QCREPORT_AUDIT_BASE_URL = `${QUALITY_MANAGEMENT_BASE_URL}/qcReportAudit`;
// 复检任务审核
export const CREATE_REPEATQC_BASE_URL = `${QUALITY_MANAGEMENT_BASE_URL}/createRepeatQcAudit`;
// 质检计划
export const QCPLAN_BASE_URL = `${QUALITY_MANAGEMENT_BASE_URL}/qcPlan`;

// 质量建模
export const QUALITY_MODELING_BASE_URL = '/knowledgeManagement';
// 质检项
export const QCITEMS_BASE_URL = `${QUALITY_MODELING_BASE_URL}/qcItems`;
// 质检项分类
export const QCITEMS_GROUP_BASE_URL = `${QUALITY_MODELING_BASE_URL}/qcItemsGroup`;
// 质检方案
export const QCCONFIGS_BASE_URL = `${QUALITY_MODELING_BASE_URL}/qcConfigs`;

// 质检任务列表
export const toQcTaskList = params => {
  const queryUrl = params ? `?query=${encodeURIComponent(JSON.stringify(params))}` : '';
  return `${QCTASK_BASE_URL}/list${queryUrl}`;
};

// 质检任务详情
export const toQcTaskDetail = ({ code }) => {
  return `${QCTASK_BASE_URL}/detail/${code}`;
};

// 质检任务操作日志
export const toQcTaskOperationLog = ({ code }) => {
  return `${QCTASK_BASE_URL}/detail/${code}/operationLog`;
};

// 质检报告审核详情
export const toQcReportAuditDetail = ({ code }) => {
  return `${QCREPORT_AUDIT_BASE_URL}/detail/${code}`;
};

// 创建复检审核申请详情
export const toCreateRepeatQcAuditDetail = ({ code }) => {
  return `${CREATE_REPEATQC_BASE_URL}/detail/${code}`;
};

// 质检项列表
export const toQcItemList = () => {
  return QCITEMS_BASE_URL;
};

// 质检项详情
export const toQcItemDetail = id => {
  return `${QCITEMS_BASE_URL}/detail/${id}`;
};

// 复制质检项
export const toCopyQcItem = id => {
  return `${QCITEMS_BASE_URL}/copy/${id}`;
};

// 创建质检项
export const toCreateQcItem = () => {
  return `${QCITEMS_BASE_URL}/create`;
};

// 编辑质检项
export const toEditQcItem = id => {
  return `${QCITEMS_BASE_URL}/edit/${id}`;
};

// 质检项操作记录
export const toQcItemOperationLog = id => {
  return `${QCITEMS_BASE_URL}/detail/${id}/operationLog`;
};

// 质检项导入日志
export const toQcItemsImportLog = () => {
  return `${QCITEMS_BASE_URL}/importLog`;
};

// 质检项导入日志详情
export const toQcItemsImportDetail = id => {
  return `${QCITEMS_BASE_URL}/importLog/detail/${id}`;
};

// 质检项分类列表
export const toQcItemsGroupList = () => {
  return QCITEMS_GROUP_BASE_URL;
};

// AQL
export const toAQLStandard = () => {
  return `${QUALITY_MODELING_BASE_URL}/AQL`;
};

// 不良等级列表
export const toQcDefectRankList = () => {
  return `${QUALITY_MODELING_BASE_URL}/qcDefectRank`;
};

// 不良原因列表
export const toQcDefectReasonList = () => {
  return `${QUALITY_MODELING_BASE_URL}/qcDefectReason`;
};

// 质检方案列表
export const toQcConfigsList = () => {
  return QCCONFIGS_BASE_URL;
};

// 创建质检方案
export const toCreateQcConfig = () => {
  return `${QCCONFIGS_BASE_URL}/create`;
};

// 复制质检方案
export const toCopyQcConfig = id => {
  return `${QCCONFIGS_BASE_URL}/${id}/copy`;
};

// 质检方案详情
export const toQcConfigDetail = id => {
  return `${QCCONFIGS_BASE_URL}/${id}/detail`;
};

// 编辑质检方案
export const toEditQcConfig = id => {
  return `${QCCONFIGS_BASE_URL}/${id}/edit`;
};

// 质检方案操作记录
export const toQcConfigOperationLog = id => {
  return `${QCCONFIGS_BASE_URL}/${id}/detail/operationLog`;
};

// 质检计划列表
export const toQcPlanList = () => {
  return `${QCPLAN_BASE_URL}/list`;
};

// 创建质检计划
export const toCreateQcPlan = () => {
  return `${QCPLAN_BASE_URL}/create`;
};

// 编辑质检计划
export const toEditQcPlan = params => {
  const { code, category } = params;
  const queryParams = { category };
  const queryUrl = qs.stringify(queryParams);
  const url = `${QCPLAN_BASE_URL}/edit/${code}?${queryUrl}`;
  return url;
};

export default toQcTaskList;
