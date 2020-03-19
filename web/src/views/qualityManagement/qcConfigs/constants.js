import _ from 'lodash';
import {
  ORGANIZATION_CONFIG,
  getOrganizationConfigFromLocalStorage,
  isOrganizationUseQrCode,
} from 'src/utils/organizationConfig';

const config = getOrganizationConfigFromLocalStorage();
export const useQrCode = isOrganizationUseQrCode();
export const qcReportRecordCountSettable =
  _.get(config, `${ORGANIZATION_CONFIG.qcReportRecordCountSettable}.configValue`) === 'true';
// 质检方案基本信息
export const baseInfoHeaders = _.compact([
  '编号',
  '名称',
  '状态',
  '质检类型',
  '质检方式',
  '质检数量',
  '记录方式',
  qcReportRecordCountSettable && '报告记录数量',
  qcReportRecordCountSettable && '单位数量',
  qcReportRecordCountSettable && '单位名称',
  useQrCode && '报废性抽检',
  '自动生成任务',
  '质检频次',
  '质检频次数字',
  useQrCode && '样本判定维度',
  '质检项填写',
]);

export const baseInfoHeadersDesc = _.compact([
  '可以为空。为空时新建。仅数字',
  '不能为空。只可输入英文字母、中文、数字、_-',
  '不能为空。仅可输入以下数字中的一个——有效：1，无效：0',
  '不能为空。仅可输入数字以下数字中的一个——入厂检：1，出厂检：2，首检：3，生产检：4',
  '不能为空。仅可输入以下数字中的一个——全检：1，比例抽检：2，固定抽检：3，自定义抽检：4，AQL：5，质检项抽检：6',
  '当质检方式为“比例抽检”或“固定抽检”时才需填写。比例抽检时仅能填1-99间的数字，固定抽检时仅能填大于0的数字。且数字最多6位小数',
  '不能为空。仅可输入以下数字中的一个——单体记录：1，质检项记录：2，仅记录次品数：3',
  qcReportRecordCountSettable && '不能为空。仅可输入以下数字中的一个——一码一体：1，使用物料单位：2，自定义：3',
  qcReportRecordCountSettable && '当报告记录数量为“自定义”时才需填写。且仅能填大于0的整数',
  qcReportRecordCountSettable && '当报告记录数量为“自定义”时才需填写。不超过10个字符',
  useQrCode && '不能为空。仅可输入以下数字中的一个——是：1，否：0',
  '不能为空。仅可输入以下数字中的一个——是：1，否：0',
  '当质检类型为“生产检”且自动生成质检任务为“是”时才需填写。仅可输入以下数字中的一个——定时：1，定量：2，固定次数：3，定码：4',
  '当质检类型为“生产检”且自动生成质检任务为“是”时才需填写。且仅能填大于等于0的整数。当质检频次为“1-定时”时，质检频次数字为分钟数；当质检频次为“2-定量”时，如果定量为全部数量，则填写“0”',
  useQrCode && '不能为空。仅可输入以下数字中的一个——每个样本二维码分开判定：1；判定样本总体质量情况：2',
  '不能为空。仅可输入以下数字中的一个——全部填写：1，可以为空：2',
]);

export const materialsHeaderDesc = [
  '不能为空。仅数字，且该编号的质检方案在系统中已存在',
  '不能为空。且该编号的物料在系统中已存在',
  '当对应的质检方案的报告记录数量为“使用物料单位”时才需填写。而且必须为对应的物料的单位中的一种',
];

export const qcCheckItemsHeaderDesc = [
  '不能为空。仅数字，且该编号的质检方案在系统中已存在',
  '不能为空。且该质检项分类在系统中已存在',
  '不能为空。且该质检项在系统中已存在，并且该质检项对应的分类和前面的分类一致',
  '当对应的质检方案的质检方式为“质检项抽检”时才需填写。而且仅可输入以下下数字中的一个——比例抽检：2，固定抽检：3，AQL：5',
  '当抽检类型设置为“比例抽检”或“固定抽检”时才需填写。且比例抽检时为0——100之间的数字，固定抽检时为大于0的整数。',
  '当对应的质检方案的质检方式为“AQL”或对应的抽检类型为“AQL”时才需填写。而且仅可输入以下数字中的一个——特殊检验水平S-1：1，特殊检验水平S-2：2，特殊检验水平S-3：3，特殊检验水平S-4：4，一般检验水平I：5，一般检验水平II：6，一般检验水平III：7',
  '当对应的质检方案的质检方式为“AQL”或对应的抽检类型为“AQL”时才需填写时才需填写。而且仅可输入以下数字中的一个——0.010，0.015，0.025，0.040，0.065，0.10，0.25，0.40，0.65，1.0，1.5，2.5，4.0，6.5，10，15，25，40，65，100，150，250，400，650，1000',
  '不能为空。仅可输入以下数值中的一个——区间，<,>,=,<=,>=,人工判断，手工输入，允差',
  '当标准不是“人工判断”、“手工输入”时，不能为空。且标准是“<”、“>”、“=”、“<=”、“>=”时，只输入一个数值。当标准是“区间”时，输入两个数值，对应区间的下限和上限，中间用“|”隔开。当标准是“允差”时，输入三个数值，对应标准值、上偏差、下偏差，中间用“|”隔开。且数字最多6位小数。',
  '当标准不是“人工判断”、“手工输入”时，不能为空。且该单位在系统中已存在',
  '可以为空。且该不良原因在系统中已存在。多个不良原因之间用“|”隔开',
];

// 质检方案可适用物料
export const materialsHeader = ['质检方案编号', '物料编号', '物料单位'];
// 质检方案相关质检项
export const qcCheckItemsHeader = [
  '质检方案编号',
  '质检项分类',
  '质检项名称',
  '抽检类型',
  '抽检数值',
  '检验水平',
  '接收质量限',
  '标准',
  '标准区间',
  '标准单位',
  '不良原因',
];

export const QCCONFIG_IMPORT_TYPE = {
  QC_CONFIG_BASE: {
    label: '质检方案基础信息导入',
    key: 3,
  },
  QC_CONFIG_MATERIALS: {
    label: '质检方案可适用物料导入',
    key: 4,
  },
  QC_CONFIG_CHECK_ITEM_CONFIG: {
    label: '质检方案相关质检项导入',
    key: 5,
  },
};
export default 'dummy';
