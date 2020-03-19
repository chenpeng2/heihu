import { primary, error } from 'src/styles/color';

export const knowledgeItem = {
  value: 'capacityConstraint',
  display: '产能约束',
};

export const STATUS = {
  inUse: { name: '启用中', value: 1, color: primary },
  stop: { name: '停用中', value: 0, color: error },
};

export const findStatus = v => {
  let res = null;
  Object.values(STATUS).forEach(i => {
    if (i && i.value === v) res = i;
  });

  return res;
};

// 格式化创建和编辑form的数据
export const formatFormValue = value => {
  const { workstationId, ...rest } = value || {};
  if (!(workstationId && workstationId.value && typeof workstationId.value === 'string')) {
    return;
  }
  const [type, _workstationId] = workstationId.value.split('-');

  return {
    workstationId: _workstationId,
    ...rest,
  };
};

// 获取导入日志的url
export const getImportLogUrlForDefects = () => '/knowledgeManagement/defects/importLog';

// 获取导入日志详情url
export const getImportLogDetailUrl = importId => `/knowledgeManagement/defects/importLog/detail/${importId}`;

export default 'dummy';
