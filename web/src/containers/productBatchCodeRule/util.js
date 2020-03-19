import { primary, error } from 'src/styles/color';

// 抽象出来的find函数
const findValueName = data => {
  return value => {
    let res = null;
    Object.values(data).forEach(i => {
      if (i && i.value === value) res = i;
    });

    return res;
  };
};


// 成品批次号规则类型
export const PRODUCT_BATCH_CODE_RULE_TYPE = {
  all: { name: '全部', value: null },
  preCreate: { name: '预生成', value: 1 },
  afterCreate: { name: '后生成', value: 2 },
};

// 查找批次号规则类型
export const findProductBatchCodeRuleType = findValueName(PRODUCT_BATCH_CODE_RULE_TYPE);

// 成品批次号状态
export const PRODUCT_BATCH_CODE_RULE_STATUS = {
  all: { name: '全部', value: null },
  inUse: { name: '启用中', value: 1, color: primary },
  inStop: { name: '停用中', value: 0, color: error },
};

// 查找成品批次号的状态
export const findProductBatchCodeRuleStatus = findValueName(PRODUCT_BATCH_CODE_RULE_STATUS);

// 成品批号明细类型
export const PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE = {
  constant: { name: '常量', value: 0 },
  date: { name: '日期', value: 1 },
  variable: { name: '变量', value: 2 },
  sequence: { name: '流水号', value: 3 },
};

// 查找成品批号明细类型
export const findProductBatchCodeRuleDetailType = findValueName(PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE);

// 成品批号明细的元素来源
export const PRODUCT_BATCH_CODE_RULE_DETAIL_ORIGINAL = {
  purchaseOrderCode: { name: '订单编号', length: 20, value: 0 },
  projectCode: { name: '项目编号', length: 20, value: 1 },
  projectProductCode: { name: '成品物料编号', length: 50, value: 2 },
  workshopCode: { name: '车间编号', length: 20, value: 3 },
  productionLineCode: { name: '产线编号', length: 20, value: 4 },
  workstationCode: { name: '工位编号', length: 20, value: 5 },
  projectProcessCode: { name: '工序编号', length: 20, value: 6 },
  equipmentProdCode: { name: '设备编号', length: 32, value: 7 },
  mouldCode: { name: '模具编号', length: 32, value: 8 },
};

// 查找成品批号明细的元素来源
export const findProductBatchCodeRuleDetailOriginal = findValueName(PRODUCT_BATCH_CODE_RULE_DETAIL_ORIGINAL);

// 成品批次号明细的日期格式
export const PRODUCT_BATCH_CODE_RULE_DETAIL_DATE_FORMAT = {
  dateYY: { name: 'YY', value: 0 },
  dateYYYY: { name: 'YYYY', value: 1 },
  dateYYMM: { name: 'YYMM', value: 2 },
  dateMMYY: { name: 'MMYY', value: 3 },
  dateYYMMDD: { name: 'YYMMDD', value: 4 },
  dateYYYYMMDD: { name: 'YYYYMMDD', value: 5 },
  dateYYSlashMM: { name: 'YY/MM', value: 6 },
  dateMMSlashYY: { name: 'MM/YY', value: 7 },
  dateYYSlashMMSlashDD: { name: 'YY/MM/DD', value: 8 },
  dateYYYYSlashMMSlashDD: { name: 'YYYY/MM/DD', value: 9 },
  dateYYDotMM: { name: 'YY.MM', value: 10 },
  dateMMDotYY: { name: 'MM.YY', value: 11 },
  dateYYDotMMDotMM: { name: 'YY.MM.DD', value: 12 },
  dateYYYYDotMMDotDD: { name: 'YYYY.MM.DD', value: 13 },
};

// 成品批次号明细日期格式查找
export const findProductBatchCodeRuleDetailDate = findValueName(PRODUCT_BATCH_CODE_RULE_DETAIL_DATE_FORMAT);

// 成品批次号明细的常量格式
export const PRODUCT_BATCH_CODE_RULE_DETAIL_VARIABLE_FORMAT = {
  variableUppercase: { name: '大写', value: 14 },
  variableLowercase: { name: '小写', value: 15 },
  variableUnchanged: { name: '不变', value: 16 },
};

// 成品批次号明细常量格式查找
export const findProductBatchCodeRuleDetailVariableFormat = findValueName(PRODUCT_BATCH_CODE_RULE_DETAIL_VARIABLE_FORMAT);

// 流水码制
export const PRODUCT_BATCH_CODE_RULE_DETAIL_SEQUENCE_TYPE = {
  decimalBase: { name: '十进制', value: 0 },
  duotricemaryWithoutIosz: { name: '三十二进制', value: 1 },
};

// 查找流水码
export const findProductBatchCodeRuleDetailSequenceType = findValueName(PRODUCT_BATCH_CODE_RULE_DETAIL_SEQUENCE_TYPE);

// 列表的size
export const LIST_DEFAULT_SIZE = 10;
