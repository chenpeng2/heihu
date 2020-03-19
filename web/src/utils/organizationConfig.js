import _ from 'lodash';

import { getOrganizationConfig } from 'src/services/organization';
import { orgInfo } from 'src/services/auth/user';
import LocalStorage from 'utils/localStorage';

export const setOrganizationInfoInLocalStorage = async () => {
  const res = await orgInfo();
  const info = _.get(res, 'data.data');

  LocalStorage.set('ORGANIZATION_INFO', info);
};

export const getOrganizationInfoFromLocalStorage = () => {
  return LocalStorage.get('ORGANIZATION_INFO');
};

// 将工厂的配置写入localStorage
export const setOrganizationConfigInLocalStorage = async () => {
  const res = await getOrganizationConfig();
  const config = _.keyBy(res.data.data, e => e.configKey);
  LocalStorage.set('CONFIG', config);
};

export const getOrganizationConfigFromLocalStorage = () => {
  return LocalStorage.get('CONFIG');
};

// 工厂配置的key，消除魔术字符串
export const ORGANIZATION_CONFIG = {
  parallelProcess: 'config_parallel_process',
  taskDispatchType: 'config_task_dispatch_type', // 任务派发方式
  taskOperatorExclusive: 'config_task_operator_exclusive',
  useControl: 'config_use_control',
  useQrcode: 'config_use_qrcode',
  erpSync: 'config_erp_sync',
  maxSubscribeLevel: 'config_max_subscribe_level',
  materialRequestAck: 'config_material_request_ack',
  materialRequestType: 'config_material_request_type',
  weighing: 'config_weighing',
  editProject: 'config_project_edit',
  configDocumentManagement: 'config_document_management',
  SOPConfig: 'config_sop',
  configProduceTaskDeliverable: 'config_produce_task_deliverable',
  configMbomTooling: 'config_mbom_tooling',
  baitingWorkOrder: 'config_plan_work_order_baiting',
  materialCheckDate: 'config_material_check_date',
  transferApplyWithMoveTransaction: 'config_material_request_transcation', // web创建转移申请是否需要关联移动事务
  frozenTime: 'config_frozen_time', // 启用冻结时间为1时，物料定义处有「冻结时间」字段，工序定义/工艺路线/生产BOM有「产出是否冻结」字段
  qcReportRecordCountSettable: 'config_qc_report_record_count_settable', // 质检方案处「报告记录数量」是否可设置
  configInjectWorkOrder: 'config_plan_work_order_inject_mold', // 是否启用注塑计划工单
  injectionMouldingWorkOrder: 'config_plan_work_order_inject_mold', // 是否启用注塑计划工单
  qcReportAudit: 'config_qc_report_audit', // 质检报告审核
  repeatQcAudit: 'config_repeat_qc_audit', // 复检创建审核
  configQcCheckItemComment: 'config_qc_check_item_remarkable', // 录入质检项是否添加备注
  qcDefectRanked: 'config_qc_defect_ranked', // 是否开启不良等级
  avgControl: 'config_agv_control', // 选择AGV控件,
  planWorkOrderAudit: 'config_plan_work_order_audit', // 是否开启计划工单审批
  configScheduleTask: 'config_schedule_task', // 排程方式
  BatchRecord: 'config_batch_record', // 项目是否启用批记录
  ProjectBatchRecordAudit: 'config_batch_record_audit', // 项目是否启用批记录审批
  FirstQcTaskControlConfig: 'config_origin_qc_task_control', // 首检管控程度
  ProduceTaskDeliverable: 'config_produce_task_deliverable', // 生产任务启用审批
  ValidityPeriodPrecision: 'config_validity_period_presicion', // 有效期精度
  qcItemCodingManually: 'config_qc_check_item_coding_manually', // 手工输入质检项编号
  configMaterialTransferDisplayUnit: 'config_material_transfer_display_unit',
  originQcNeedMaterialQr: 'config_origin_qc_need_material_qr', // 首检需要记录物料二维码
  configPlanWorkOrderBaiting: 'config_plan_work_order_baiting', // 下料工单
};

// 任务派发方式
export const TASK_DISPATCH_TYPE = {
  manager: 'manager', // 主管派发 = 管理员管控
  worker: 'worker', // 工人管控
  workerWeak: 'worker_weak', // 工人弱管控
};

// 是否使用二维码
export const isOrganizationUseQrCode = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `${ORGANIZATION_CONFIG.useQrcode}.configValue`) === 'true';
};

export const configHasSOP = () =>
  _.get(getOrganizationConfigFromLocalStorage(), `${ORGANIZATION_CONFIG.SOPConfig}.configValue`) === 'true';

// 获取是否使用生产任务审批
export const getTaskDeliverableOrganizationConfig = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `${ORGANIZATION_CONFIG.configProduceTaskDeliverable}.configValue`) === 'true';
};

// 获取是否使用生产任务审批
export const getToolingOrganizationConfig = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `${[ORGANIZATION_CONFIG.configMbomTooling]}.configValue`) === 'true';
};

// 获取是否使用下料工单
export const getBaitingWorkOrderConfig = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `${ORGANIZATION_CONFIG.baitingWorkOrder}.configValue`) === 'true';
};

// 获取物料审核日期的工厂配置
export const getMaterialCheckDateConfig = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `${ORGANIZATION_CONFIG.materialCheckDate}.configValue`) === 'true';
};

// 获取是否使用称量模块
export const getWeighingConfig = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `${ORGANIZATION_CONFIG.weighing}.configValue`) === 'true';
};

// 获取是否使用注塑计划工单
export const getInjectWorkOrderConfig = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `${ORGANIZATION_CONFIG.configInjectWorkOrder}.configValue`) === 'true';
};

// 质检方案报告记录数量是否可设置
export const isQcReportRecordCountSettable = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `${ORGANIZATION_CONFIG.qcReportRecordCountSettable}.configValue`) === 'true';
};

// 是否手工输入质检项编号
export const isQcItemCodingManually = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `${ORGANIZATION_CONFIG.qcItemCodingManually}.configValue`) === 'true';
};

// 首检需要记录物料二维码
export const isOriginQcNeedMaterialQr = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `${ORGANIZATION_CONFIG.originQcNeedMaterialQr}.configValue`) === 'true';
};

/**
 * @description: web创建转移申请是否需要关联移动事务
 * @wiki: http://wiki.blacklake.tech/pages/viewpage.action?pageId=6062807。配置55
 * @date: 2019/5/13 下午4:16
 */
export const isTransferApplyWithMoveTransactionConfig = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `${ORGANIZATION_CONFIG.transferApplyWithMoveTransaction}.configValue`) === '2';
};

export const getConfigCapacityConstraint = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `${ORGANIZATION_CONFIG.configScheduleTask}.configValue`) === '2';
};

/**
 * @description: 是否使用冻结时间
 *
 * 后端使用0表示false，1表示true
 *
 * @date: 2019/5/23 下午3:09
 */
export const useFrozenTime = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `${ORGANIZATION_CONFIG.frozenTime}.configValue`) === 'true';
};

// 是否有此工厂配置, 以上都是复制粘贴代码(👎)
export const includeOrganizationConfig = config => {
  const organizationConfig = getOrganizationConfigFromLocalStorage();
  return _.get(organizationConfig, `${config}.configValue`) === 'true';
};

// 工厂有效期配置
export const VALIDITY_PERIOD_PRECISION = {
  day: { value: '1', format: 'YYYY/MM/DD' },
  hour: { value: '2', format: 'YYYY/MM/DD HH' },
};

// 获取工厂有效期配置
export const getOrganizationValidityPeriodConfig = () => {
  const organizationConfig = getOrganizationConfigFromLocalStorage();
  return _.get(organizationConfig, `${ORGANIZATION_CONFIG.ValidityPeriodPrecision}.configValue`);
};

// 根据工厂配置获取有效期的精度格式
export const getValidityPeriodPrecision = () => {
  const organizationConfig = getOrganizationConfigFromLocalStorage();
  const configValue = _.get(organizationConfig, `${ORGANIZATION_CONFIG.ValidityPeriodPrecision}.configValue`);
  // moment认为YYYY/MM/DD HH不是合法时间
  if (configValue === '1') return { showFormat: 'YYYY/MM/DD', momentFormat: 'YYYY/MM/DD' };
  if (configValue === '2') return { showFormat: 'YYYY/MM/DD HH:00', momentFormat: 'YYYY/MM/DD HH:mm' };
  return { showFormat: 'YYYY/MM/DD', momentFormat: 'YYYY/MM/DD' };
};

export default 'dummy';
