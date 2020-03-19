import React from 'react';
import _ from 'lodash';
import { primary, warning, border, blueViolet, error, fontSub, success, lightGrey } from 'src/styles/color';
import { baseFind } from 'src/utils/object';

export const QCTASK_STATUS_UNSTARTED = 0; //  未开始
export const QCTASK_STATUS_STARTED = 1; //  执行中
export const QCTASK_STATUS_FINISHED = 2; //  已结束
export const QCTASK_STATUS_CANCELED = 3; //  已取消
export const QCTASK_STATUS_AUDITING = 4; //  审核中
export const QCTASK_STATUS_REJECTED = 5; //  已拒绝

export const REPEAT_QCTASK_TYPE = 1; // 复检任务
export const REPEAT_QCTASK_AUDIT_STATUS_UNSTARTED = 0; // 复检任务审核待审核
export const REPEAT_QCTASK_AUDIT_STATUS_PASSED = 1; // 复检任务审核申请通过
export const REPEAT_QCTASK_AUDIT_STATUS_REJECTED = 2; // 复检任务审核申请拒绝
export const REPEAT_QCTASK_AUDIT_STATUS_REVERTED = 1; // 复检任务审核申请撤回

export const qcTaskStatusMap = {
  [QCTASK_STATUS_UNSTARTED]: '未开始',
  [QCTASK_STATUS_STARTED]: '执行中',
  [QCTASK_STATUS_FINISHED]: '已结束',
  [QCTASK_STATUS_CANCELED]: '已取消',
  [QCTASK_STATUS_AUDITING]: '待审核',
  [QCTASK_STATUS_REJECTED]: '已拒绝',
};

export const qcTaskStatusColorMap = {
  [QCTASK_STATUS_UNSTARTED]: border,
  [QCTASK_STATUS_STARTED]: blueViolet,
  [QCTASK_STATUS_FINISHED]: success,
  [QCTASK_STATUS_CANCELED]: fontSub,
  [QCTASK_STATUS_AUDITING]: warning,
  [QCTASK_STATUS_REJECTED]: error,
};

export const passLinkStyle = { color: success, marginRight: 30, fontSize: 14 };
export const rejectLinkStyle = { color: error, marginRight: 30, fontSize: 14 };
export const revertLinkStyle = { color: success, marginRight: 30, fontSize: 14 };
export const invisibleStyle = { display: 'none' };

export const REPEAT_QCTASK_REQUEST_TYPE = 1; //  复检任务审核类型

export const QCPLAN_STATUS_ENABLE = 1; // 启用
export const QCPLAN_STATUS_DISABLE = 0; // 停用

export const QCPLAN_STATUS = {
  [QCPLAN_STATUS_ENABLE]: {
    display: '启用中',
    color: success,
  },
  [QCPLAN_STATUS_DISABLE]: {
    display: '停用中',
    color: error,
  },
};

/** 首检 */
export const FIRST_QUALITY_CONTROL = 2;
/** 生产检 */
export const MANUFACTURING_QUALITY_CONTROL = 3;
/** 复检 */
export const REPEAT_QUALITY_CHECK = 4;

export const QCPLAN_CHECK_TYPE = {
  [FIRST_QUALITY_CONTROL]: '首检',
  [MANUFACTURING_QUALITY_CONTROL]: '生产检',
};

// 生产质检报表统计时间间隔
export const produceQcIntervals = [
  {
    key: 'DAY',
    display: '按天',
    value: 6,
    datePickerMode: 'day',
  },
  {
    key: 'WEEK',
    display: '按周',
    value: 7,
    datePickerMode: 'week',
  },
  {
    key: 'MONTH',
    display: '按月',
    value: 8,
    datePickerMode: 'month',
  },
  {
    key: 'QUARTER',
    display: '按季度',
    value: 9,
    datePickerMode: 'day',
  },
];

export const INPUT_FACTORY_QC = 0; //  入厂检
export const OUTPUT_FACTORY_QC = 1; //  出厂检
export const PRODUCE_ORIGIN_QC = 2; //  首检
export const PRODUCE_QC = 3; //  生产检
export const INSPECTION_QC = 4; //  巡检
export const COMMON_QC = 5; //  通用检

export const CHECK_TYPE = {
  [INPUT_FACTORY_QC]: '入厂检',
  [OUTPUT_FACTORY_QC]: '出厂检',
  [PRODUCE_ORIGIN_QC]: '首检',
  [PRODUCE_QC]: '生产检',
  [INSPECTION_QC]: '巡检',
  [COMMON_QC]: '通用检',
};

export const FULL_CHECK = 0; // 全检
export const RATIO_CHECK = 1; // 比例抽检
export const QUANTITY_CHECK = 2; // 固定抽检
export const CUSTOM_CHECK = 3; // 自定义抽检
export const AQL_CHECK = 4; // AQL
export const CHECKITEM_CHECK = 5; // 质检项抽检

export const CHECKCOUNT_TYPE = {
  [FULL_CHECK]: '全检',
  [RATIO_CHECK]: '比例抽检',
  [QUANTITY_CHECK]: '固定抽检',
  [CUSTOM_CHECK]: '自定义抽检',
  [AQL_CHECK]: 'AQL',
  [CHECKITEM_CHECK]: '质检项抽检',
};

export const CHECKITEM_CHECKCOUNT_TYPE = {
  [RATIO_CHECK]: '比例抽检',
  [QUANTITY_CHECK]: '固定抽检',
  [AQL_CHECK]: 'AQL',
};

export const BY_ENTITY = 0; // 单体记录
export const BY_CHECK_ITEM = 1; // 质检项记录
export const ONLY_RESULT_DEFECT = 2; // 仅记录次品数

export const RECORD_TYPE = {
  [BY_ENTITY]: {
    display: '单体记录',
    desc: '以单体维度记录每个质检项的质检结果',
  },
  [BY_CHECK_ITEM]: {
    display: '质检项记录',
    desc: '以质检项维度记录每个单体的质检结果',
  },
  [ONLY_RESULT_DEFECT]: {
    display: '仅记录次品数',
    desc: '以质检项维度记录次品数量',
  },
};

// 质量状态
export const QUALITY_STATUS_QUALIFIED = 1; // 合格
export const QUALITY_STATUS_DEVIATION_QUALIFIED = 2; // 让步合格
export const QUALITY_STATUS_AWAIT_CHECK = 3; // 待检
export const QUALITY_STATUS_UNQUALIFIED = 4; // 不合格
export const QUALITY_STATUS_ON_HOLD = 5; // 暂控

export const QUALITY_STATUS = {
  [QUALITY_STATUS_QUALIFIED]: { name: '合格', color: primary, value: QUALITY_STATUS_QUALIFIED },
  [QUALITY_STATUS_DEVIATION_QUALIFIED]: { name: '让步合格', color: primary, value: QUALITY_STATUS_DEVIATION_QUALIFIED },
  [QUALITY_STATUS_AWAIT_CHECK]: { name: '待检', color: lightGrey, value: QUALITY_STATUS_AWAIT_CHECK },
  [QUALITY_STATUS_UNQUALIFIED]: { name: '不合格', color: error, value: QUALITY_STATUS_UNQUALIFIED },
  [QUALITY_STATUS_ON_HOLD]: { name: '暂控', color: lightGrey, value: QUALITY_STATUS_ON_HOLD },
};

// 不合格状态
export const unqualifiedQualityStatusMap = _.omit(QUALITY_STATUS, [QUALITY_STATUS_QUALIFIED]);

// TODO：把这个质量状态的常量替换成QUALITY_STATUS
// 质量状态
export const qcStatus = {
  1: '合格',
  2: '让步合格',
  3: '待检',
  4: '不合格',
  5: '暂控',
};

// 根据value查找质量状态
export const findQualityStatus = baseFind(QUALITY_STATUS);

export const QCCONFIG_INVALID = 0;
export const QCCONFIG_VALID = 1;

export const QCCONFIG_STATE = {
  [QCCONFIG_VALID]: '有效',
  [QCCONFIG_INVALID]: '无效',
};

export const BETWEEN = 0;
export const LT = 1;
export const GT = 2;
export const EQ = 3;
export const LTE = 4;
export const GTE = 5;
export const YN = 6;
export const MANUAL = 7;
export const TOLERANCE = 8;

export const QCLOGIC_TYPE = {
  [BETWEEN]: {
    value: 'between',
    display: '区间',
  },
  [LT]: {
    value: 'lt',
    display: '<',
  },
  [GT]: {
    value: 'gt',
    display: '>',
  },
  [EQ]: {
    value: 'equal',
    display: '=',
  },
  [LTE]: {
    value: 'lte',
    display: '≤',
  },
  [GTE]: {
    value: 'gte',
    display: '≥',
  },
  [YN]: {
    value: 'yn',
    display: '人工判断',
  },
  [MANUAL]: {
    value: 'manual',
    display: '手工输入',
  },
  [TOLERANCE]: {
    value: 'tolerance',
    display: '允差',
  },
};
// 首检管控程度
export const FIRST_QCTASK_CONTROL_LEVEL_WEAK = 1; // 首检弱管控
export const FIRST_QCTASK_CONTROL_LEVEL_STRONG = 2; // 首检强管控

export const firstQcTaskControlLevelMap = {
  [FIRST_QCTASK_CONTROL_LEVEL_WEAK]: '弱管控',
  [FIRST_QCTASK_CONTROL_LEVEL_STRONG]: '强管控',
};

export const USE_QR_CODE = 0; //  一码一体
export const USE_MATERIAL_UNIT = 1; // 使用物料单位
export const USE_CUSTOM_UNIT = 2; // 自定义

export const CHECK_ENTITY_TYPE = {
  [USE_QR_CODE]: {
    label: '一码一体',
    key: 0,
    desc: '一码一体：一个样本二维码作为一个单体记录一份报告明细',
  },
  [USE_MATERIAL_UNIT]: {
    label: '使用物料单位',
    key: 1,
    desc: '使用物料单位：按照添加的样本物料数量和物料单位进行计算，得出要填写的报告数量',
  },
  [USE_CUSTOM_UNIT]: {
    label: '自定义',
    key: 2,
    desc: '自定义：自己定义所需检验的报告份数，包括单位名称。例如：3份',
  },
};

export const BY_QR_CODE = 0;
export const BY_SAMPLE_SUMMARY = 1;

export const SAMPLE_RESULT_TYPE = {
  [BY_QR_CODE]: {
    label: '每个样本二维码分开判定',
    key: 0,
    desc:
      '例如：样本二维码000001，抽样总量10，合格量8，让步合格量1，不合格量1；样本二维码000002，抽样总量10，合格量10，让步合格量0，不合格量0；',
  },
  [BY_SAMPLE_SUMMARY]: {
    label: '判定样本总体质量情况',
    key: 1,
    desc: '例如：抽样总量20，合格量18，让步合格量1，不合格量1',
  },
};

export const CREATE_TYPE_TIMED = 0; //  定时
export const CREATE_TYPE_QUANTITATIVE = 1; // 定量
export const CREATE_TYPE_FIXED_COUNT = 2; // 固定次数
export const CREATE_TYPE_FIXED_QCCODE_AMOUNT = 3; // 定码

export const TASK_CREATE_TYPE = {
  [CREATE_TYPE_TIMED]: '定时',
  [CREATE_TYPE_QUANTITATIVE]: '定量',
  [CREATE_TYPE_FIXED_COUNT]: '固定次数',
  [CREATE_TYPE_FIXED_QCCODE_AMOUNT]: '定码',
};

export const RECORD_CHECKITEM_TYPE_FULL = 0;
export const RECORD_CHECKITEM_TYPE_PARTIAL = 1;

export const RECORD_CHECKITEM_TYPE = {
  [RECORD_CHECKITEM_TYPE_FULL]: '全部填写',
  [RECORD_CHECKITEM_TYPE_PARTIAL]: '可以为空',
};

export const LOGIC = {
  BETWEEN: 0, // 区间
  LT: 1, // 小于
  GT: 2, // 大于
  EQ: 3, // 等于
  LTE: 4, // 小于等于
  GTE: 5, // 大于等于
  YN: 6, // 人工判断
  MANUAL: 7, // 手工输入
  TOLERANCE: 8, // 允差
};

export const QcTask_Classification = {
  ORIGIN_QC: 0, // 一般分类
  INSPECTION_QC: 1, // 巡检
  COMMON_QC: 2, // 通用检
};

export const QC_MATERIAL_CATEGORY = {
  QC_TOTAL: {
    key: 'QC_TOTAL',
    value: 0,
  },
  // 样本
  QC_SAMPLE: {
    key: 'QC_SAMPLE',
    value: 1,
  },
};

export const FIRST_CHECK = 0; //  首检
export const REVIEW_CHECK = 1; //  复检

export const QC_TASK_TYPE = {
  // 首检
  [FIRST_CHECK]: '首检',
  // 复检
  [REVIEW_CHECK]: '复检',
};

/** 计划工单分类 */
export const PLAN_WORK_ORDER_CATEGORY = {
  common: {
    id: 1,
    name: '普通',
  },
  blanking: {
    id: 2,
    name: '下料',
  },
  injectMold: {
    id: 3,
    name: '注塑',
  },
};

export default 'dummy';
