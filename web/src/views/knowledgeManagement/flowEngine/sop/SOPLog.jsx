import React from 'react';
import { getSOPLog } from 'services/knowledgeBase/sop';
import SOPLogBase from './component/SOPLogBase';

const operatorTypeMap = new Map([
  [1, '创建SOP'],
  [2, '编辑SOP'],
  [3, '复制SOP'],
  [4, '启用SOP'],
  [5, '停用SOP'],
  [6, '创建步骤'],
  [7, '更新步骤'],
  [8, '删除步骤'],
  [9, '复制步骤'],
  [10, '创建步骤组'],
  [11, '更新步骤组'],
  [12, '删除步骤组'],
  [13, '复制步骤组'],
]);

const SOPLog = props => {
  return <SOPLogBase {...props} operatorTypeMap={operatorTypeMap} getLogApi={getSOPLog} />;
};

export default SOPLog;
