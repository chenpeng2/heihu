import React from 'react';
import { getSOPTemplateLog } from 'services/knowledgeBase/sopTemplate';
import SOPLog from '../sop/component/SOPLogBase';

const operatorTypeMap = new Map([
  [1, '创建SOP模板'],
  [2, '编辑SOP模板'],
  [3, '复制SOP模板'],
  [4, '启用SOP模板'],
  [5, '停用SOP模板'],
  [6, '创建步骤'],
  [7, '更新步骤'],
  [8, '删除步骤'],
  [9, '复制步骤'],
  [10, '创建步骤组'],
  [11, '更新步骤组'],
  [12, '删除步骤组'],
  [13, '复制步骤组'],
  [14, '批量创建SOP'],
]);

const SOPTemplateLog = props => {
  return <SOPLog {...props} operatorTypeMap={operatorTypeMap} getLogApi={getSOPTemplateLog} />;
};

export default SOPTemplateLog;
