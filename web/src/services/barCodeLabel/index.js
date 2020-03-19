import request from 'utils/request';

const prefix = 'manufacture/v1/barcode_label';

// 查询成品条码标签规则列表
export const getBarcodeRuleList = (params) => {
  return request.get(`${prefix}/rule/_list`, { params });
};

// 创建成品条码标签规则
export const createBarcodeLabelRule = (params) => {
  return request.post(`${prefix}/rule/_add`, params);
};

// 编辑成品条码标签规则
export const updateBarcodeLabelRule = (ruleId, params) => {
  return request.post(`${prefix}/rule/${ruleId}/_update`, params);
};

// 查询成品条码标签规则详情
export const getBarcodeLabelRuleDetail = ruleId => {
  return request.get(`${prefix}/rule/${ruleId}`);
};

// 启用成品条码标签规则
export const enableBarcodeLabelRule = (ruleId, forceDefault) => {
  return request.post(`${prefix}/rule/${ruleId}/_enable?forceDefault=${forceDefault}`);
};

// 停用成品条码标签规则
export const disableBarcodeLabelRule = ruleId => {
  return request.post(`${prefix}/rule/${ruleId}/_disable`);
};

// 查询成品条码标签规则操作记录
export const getBarcodeLabelRuleOperationLogs = ({ ruleId, ...params }) => {
  return request.get(`${prefix}/rule/${ruleId}/history`, { params });
};

// 获取项目批次号
export const getProductBatchSeq = (params) => {
  return request.get(`${prefix}/label/productBatchSeq`, { params });
};

// 查询条码标签列表
export const getBarcodeLabelList = (params) => {
  const { size, page, ...rest } = params || {};

  return request.post(`${prefix}/label/_list?size=${size || 10}&page=${page || 1}`,
    {
      ...rest,
      sorts: [
        {
          sortByField: 'createAt',
          sortAsc: false,
        },
        {
          sortByField: 'labelSeq',
          sortAsc: true,
        },
      ],
    });
};

// 创建条码标签
export const createBarcodeLabelList = (params) => {
  return request.post(`${prefix}/label/_generate`, params);
};

// 导出条码
export const exportBarcodeLabel = (params) => {
  return request.post(`${prefix}/label/_export`, params);
};

// 条码标签导出记录
export const barcodeExportHistory = (id, params) => {
  return request.get(`${prefix}/label/${id}/exportRecord`, { params });
};

// 条码标签打印记录
export const barcodePrintHistory = (id, params) => {
  return request.get(`${prefix}/label/${id}/printRecord`, { params });
};

// 删除条码
export const deleteBarcodeLabel = (params) => {
  return request.post(`${prefix}/label/_delete`, params);
};

// 获取label信息来打印
export const getLabelInfoForPrint = (params) => {
  return request.post(`${prefix}/label/print/_list`, params);
};

// 增加条码标签打印次数
export const addLabelPrintCount = (params) => {
  return request.post(`${prefix}/label/_increasePrintCount`, params);
};

// 批量启用编号规则

export const enableBulkProductBatchCodeRule = (ruleId) => {
  return request.post(`${prefix}/rule/_bulk_enable?ruleId=${ruleId}`);
};

// 批量停用用编号规则

export const disableBulkProductBatchCodeRule = (ruleId) => {
  return request.post(`${prefix}/rule/_bulk_disable?ruleId=${ruleId}`);
};

// 启用所有编号规则

export const enableAllProductBatchCodeRule = (params) => {
  return request.post(`${prefix}/rule/_all_enable?searchRuleName=${params.searchRuleName}&searchStatuses=${params.searchStatuses}`);
};

// 停用所有编号规则

export const disableAllProductBatchCodeRule = (params) => {
  return request.post(`${prefix}/rule/_all_disable?searchRuleName=${params.searchRuleName}&searchStatuses=${params.searchStatuses}`);
};

export default 'dummy';
