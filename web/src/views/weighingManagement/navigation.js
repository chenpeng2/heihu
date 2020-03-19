export const BASE_URL = '/weighingManagement';
export const DEF_BASE_URL = `${BASE_URL}/weighingDefinition`;
export const TASK_BASE_URL = `${BASE_URL}/weighingTask`;

// 称量定义列表
export const toWeighingDefinitionList = () => {
  return `${DEF_BASE_URL}`;
};

// 称量任务日志
export const toWeighingTaskLog = ({ id }) => {
  return `${TASK_BASE_URL}/detail/${id}/log`;
};

// 称量定义导入日志
export const toWeighingDefintionLog = () => {
  return `${DEF_BASE_URL}/importLogs`;
};

// 称量定义导入日志详情
export const toWeighingDefinitionImportDetail = ({ importId }) => {
  return `${DEF_BASE_URL}/importLogs/detail/${importId}`;
};

export default 'dummy';
