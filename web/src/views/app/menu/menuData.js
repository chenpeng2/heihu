/*
 * menu的数据结构：树形数据结构。
 *
 * 对每一个节点来说：
 * path是必须的。没有path会不显示。
 * disable，可以用来显示或隐藏。
 * icon对树干节点来说可以用来显示左边icon。
 * auth用来做权限判断。
 * organizationConfig用来做工厂配置和menu是否显示的联系。为[{key: 'xxx', value: 'xxx' || ['xxx']}]这样的格式来表示这个menu需要那些工厂配置。用数组来表示对同一个organizationConfig的或的关系
 *
 * 如果需要可以，添加config属性来添加organization config判断
 *
 * */
import _ from 'lodash';

import auth, { getAuthFromLocalStorage } from 'src/utils/auth';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import { arrayIsEmpty } from 'src/utils/array';

const {
  WEB_PROD_HIST_PRORUCTION_REPORT,
  WEB_VIEW_PURCHASE_ORDER,
  WEB_VIEW_PROJECT,
  WEB_VIEW_PROCURE_ORDER,
  WEB_VIEW_PRODUCE_TASK,
  WEB_PROD_CURRENT_PRODUCTION_REPORT,
  WEB_PROD_PROGRESS_REPORT,
  WEB_HISTORY_TRACE,
  WEB_VIEW_MATERIAL_DEF,
  WEB_DELIVERY_HISTORY_TRACE,
  WEB_VIEW_REPAIR_TASK,
  WEB_VIEW_CHECK_TASK,
  WEB_VIEW_MAINTAIN_TASK,
  WEB_VIEW_PREPARETION_TIME,
  WEB_PURCHASE_CUSTOM_FIELD,
} = auth;

export const getDirectoryStructre = customLanguage => {
  return [
    {
      title: '生产管理',
      icon: '_shengchanguanli_Webcelan',
      path: 'cooperate',
      children: [
        {
          title: '销售订单',
          path: 'cooperate/purchaseOrders',
          auth: WEB_VIEW_PURCHASE_ORDER,
        },
        {
          title: '计划工单',
          path: 'cooperate/plannedTicket',
          organizationConfig: [{ key: ORGANIZATION_CONFIG.taskDispatchType, value: 'manager' }],
          auth: auth.WEB_VIEW_PLAN_WORK_ORDER,
        },
        {
          title: '项目',
          path: 'cooperate/projects',
          auth: WEB_VIEW_PROJECT,
        },
        {
          title: '物料请求',
          path: 'cooperate/materialRequest',
          auth: auth.WEB_VIEW_MATERIAL_REQUEST,
          disable: true,
        },
        {
          title: '排程',
          path: 'cooperate/taskSchedule',
          organizationConfig: [{ key: ORGANIZATION_CONFIG.taskDispatchType, value: 'manager' }],
          auth: auth.WEB_VIEW_PLAN_WORK_ORDER,
        },
        {
          title: `${customLanguage.procure_order}`,
          path: 'cooperate/purchaseLists',
          auth: WEB_VIEW_PROCURE_ORDER,
          organizationConfig: [{ key: ORGANIZATION_CONFIG.taskDispatchType, value: ['manager', 'worker'] }],
        },
        {
          title: '生产任务',
          path: 'cooperate/prodTasks',
          auth: WEB_VIEW_PRODUCE_TASK,
        },
        {
          title: '下料任务',
          path: 'cooperate/blankingTasks',
          organizationConfig: [{ key: ORGANIZATION_CONFIG.configPlanWorkOrderBaiting, value: 'true' }],
        },
        {
          title: '合并任务',
          path: 'cooperate/inject-mold-tasks',
          auth: auth.WEB_INJECT_MOLD_TASK,
          organizationConfig: [{ key: ORGANIZATION_CONFIG.injectionMouldingWorkOrder, value: 'true' }],
        },
        {
          title: 'SOP任务',
          path: 'cooperate/SOPTask',
          auth: auth.WEB_SOP_TASK_LIST,
          organizationConfig: [{ key: ORGANIZATION_CONFIG.SOPConfig, value: 'true' }],
        },
        {
          title: '生产看板',
        },
        {
          title: '生产报表',
          path: 'cooperate/productionRecords',
          // auth: auth.WEB_VIEW_PROD_REPORT,
          children: [
            {
              title: '产量统计报表',
              path: 'cooperate/productionRecords',
              auth: auth.WEB_PROD_PRODUCTION_REPORT,
            },
            {
              title: '生产进度报表',
              path: 'cooperate/prodReports',
              auth: WEB_PROD_PROGRESS_REPORT,
            },
            {
              title: '订单交货报表',
              path: 'stock/materialRecords-purchaseOrderSummary',
              auth: auth.WEB_SALES_ORDER_DELIVERY_REPORT,
            },
            {
              title: '产能报表',
              path: 'cooperate/productionCapacityRecords',
            },
            {
              title: '生产工时报表',
              path: 'cooperate/production-work-time-records',
              auth: auth.WEB_PROD_CYCLE_TIME_REPORT,
            },
            {
              title: '生产投产物料统计',
              path: 'cooperate/production-input-material-records',
              auth: auth.WEB_PROD_MATERIAL_CONSUMPTION_REPORT,
            },
            {
              title: '生产次品',
              path: 'cooperate/production-defect-report',
              auth: auth.WEB_DEFECT_PRODUCTION_REPORT,
            },
          ],
        },
      ],
    },
    {
      title: '物料管理',
      path: 'stock',
      icon: '_wuliaoguanli_Webcelan',
      children: [
        {
          title: '备料任务',
        },
        {
          title: '发运申请',
          path: 'stock/deliveryRequest',
          auth: auth.WEB_DELIVERY_REQUEST_MANAGEMENT,
        },
        {
          title: '现有量查询',
          path: 'currentAmount',
          auth: auth.WEB_VIEW_MATERIAL_AMOUNT,
          children: [
            {
              title: '二维码查询',
              path: 'stock/qrCode',
              auth: auth.WEB_VIEW_MATERIAL_LOT_OF_QRCODE,
              organizationConfig: [{ key: ORGANIZATION_CONFIG.useQrcode, value: 'true' }],
            },
            {
              title: '库存查询',
              path: 'stock/inventory',
              auth: auth.WEB_VIEW_INVENTORY,
            },
          ],
        },
        {
          title: '记录查询',
          path: 'recordSearch',
          children: [
            {
              title: '合并记录',
              path: 'stock/qrCodeMergeRecords',
              auth: auth.WEB_MATERIAL_LOT_MERGE,
            },
            {
              title: '入厂记录',
              auth: auth.WEB_VIEW_ADMIT_RECORD,
              path: 'stock/initLgTransfers',
            },
            {
              title: '出厂记录',
              path: 'stock/deliverLgTransfers',
              auth: auth.WEB_VIEW_DELIVER_RECORD,
            },
            {
              title: '退料记录',
              path: 'stock/withdrawRecord',
              auth: auth.WEB_VIEW_ADMIT_REVERSE_RECORD,
            },
            {
              title: '事务记录',
              path: 'stock/storageAdjustRecord',
              auth: auth.WEB_VIEW_INVENTORY_TRANSACTION_LOG,
            },
            {
              title: '盘点记录',
              path: 'stock/stockCheckRecord',
              auth: auth.WEB_VIEW_TRALLYING_RECORD,
              organizationConfig: [{ key: ORGANIZATION_CONFIG.useQrcode, value: 'true' }],
            },
            {
              title: '转移记录',
              path: 'stock/materialTransferRecordList',
              auth: auth.WEB_VIEW_TRANSFER_RECORD,
            },
            {
              title: '拆分记录',
              path: 'stock/splitRecord',
              auth: auth.WEB_VIEW_MATERIAL_LOT_SPLIT,
              organizationConfig: [{ key: ORGANIZATION_CONFIG.useQrcode, value: 'true' }],
            },
            {
              title: '批量合并',
            },
          ],
        },
        {
          title: '物料看板',
        },
        {
          title: '物料报表',
          path: 'stock/materialRecords',
          children: [
            {
              title: '监控台',
              path: 'stock/monitor',
              organizationConfig: [{ key: ORGANIZATION_CONFIG.useQrcode, value: 'true' }],
              auth: auth.WEB_VIEW_WATCH_DASHBOARD,
            },
            {
              title: '物料汇总报表',
              path: 'stock/materialCollectReport',
              organizationConfig: [{ key: ORGANIZATION_CONFIG.useQrcode, value: 'true' }],
              auth: auth.WEB_VIEW_MATERIAL_LOT_SUMMARY_REPORT,
            },
          ],
        },
        {
          title: '成品批号规则',
          path: 'stock/productBatchCodeRule',
        },
        {
          title: '物料追溯',
          path: 'stock/material-trace',
        },
        {
          title: '转移申请',
          path: 'stock/transferApply',
          auth: auth.WEB_VIEW_MATERIAL_TRANSFER_REQUEST_WEB,
        },
        {
          title: '入库单',
          path: 'stock/inboundOrder',
          auth: auth.WEB_VIEW_INBOUND_ORDER,
        },
      ],
    },
    {
      title: '质量管理',
      path: 'qualityManagement',
      icon: '_zhiliangguanli_Webcelan',
      children: [
        { title: '质检计划', path: 'qualityManagement/qcPlan' },
        {
          title: '质检任务',
          path: 'qualityManagement/qcTask',
          auth: auth.WEB_VIEW_QUALITY_TESTING_TASK,
        },
        {
          title: '质检报告审核',
          path: 'qualityManagement/qcReportAudit',
          auth: auth.WEB_QUALITY_REPORT_VERIFY,
          organizationConfig: [{ key: ORGANIZATION_CONFIG.qcReportAudit, value: 'true' }],
        },
        {
          title: '复检创建审核',
          path: 'qualityManagement/createRepeatQcAudit',
          auth: auth.WEB_QUALITY_REPORT_VERIFY,
          organizationConfig: [{ key: ORGANIZATION_CONFIG.repeatQcAudit, value: 'true' }],
        },
        {
          title: '质检看板',
        },
        {
          title: '质检报表',
        },
        {
          title: '生产质量报表',
          path: 'produce-quality-chart',
          children: [
            {
              title: '项目质量报表',
              path: 'qualityManagement/produce-project-quality-chart',
              auth: auth.WEB_QUALITY_REPORT,
            },
            {
              title: '质检任务报表',
              path: 'qualityManagement/produce-qc-task-chart',
              auth: auth.WEB_QUALITY_REPORT,
            },
          ],
        },
        {
          title: '入厂质量报表',
          path: 'inbound-quality-chart',
          children: [
            {
              title: '质检任务报表',
              path: 'qualityManagement/inbound-qc-task-chart',
              auth: auth.WEB_QUALITY_REPORT,
            },
            {
              title: '来料不良报表',
              path: 'qualityManagement/inbound-fraction-chart',
              auth: auth.WEB_QUALITY_REPORT,
            },
          ],
        },
      ],
    },
    {
      title: '物流管理',
      children: [
        {
          title: '物流请求',
        },
        {
          title: '物流任务',
        },
      ],
    },
    {
      title: '设备维护',
      path: 'equipmentMaintenance',
      icon: '_shebeiweihu_Webcelan',
      children: [
        {
          title: '维修任务',
          path: 'equipmentMaintenance/repairTask',
          auth: WEB_VIEW_REPAIR_TASK,
        },
        {
          title: '保养任务',
          path: 'equipmentMaintenance/maintenanceTask',
          auth: WEB_VIEW_MAINTAIN_TASK,
        },
        {
          title: '点检任务',
          path: 'equipmentMaintenance/checkTask',
          auth: WEB_VIEW_CHECK_TASK,
        },
        {
          title: '设备管理',
          path: 'equipmentMaintenance/device',
          auth: auth.WEB_VIEW_EQUIPMENT,
        },
        {
          title: '设备概览',
          path: 'equipmentMaintenance/equipOverview',
          // auth: auth.WEB_VIEW_EQUIPMENT_OVERVIEW,
        },
        {
          title: '模具管理',
          path: 'equipmentMaintenance/tooling',
          auth: auth.WEB_VIEW_TOOLING,
        },
      ],
    },
    {
      title: '称量管理',
      path: 'weighingManagement',
      icon: 'chenglianglv',
      children: [
        {
          title: '称量任务',
          path: 'weighingManagement/weighingTask',
          auth: auth.WEB_MANAGE_WEIGH_TASK,
        },
        {
          title: '称量定义',
          path: 'weighingManagement/weighingDefinition',
          auth: auth.WEB_MANAGE_WEIGH_CONFIG,
        },
      ],
    },
    {
      title: '数据看板',
      path: 'dashboard',
      icon: 'shujukanban',
      children: [
        {
          title: 'BI看板',
          path: 'dashboard/dynamic',
        },
      ],
    },
    {
      title: '事件与消息',
      icon: '_yichangshijian_Webcelan',
      path: 'exceptionalEventMenu',
      children: [
        {
          title: '异常事件管理',
          path: 'exceptionalEvent/exceptionalEventManagement',
        },
      ],
    },
    {
      title: '知识引擎',
      path: 'knowledgeManagement',
      icon: '_zhishiyinqing_Webcelan',
      children: [
        {
          title: '工厂建模',
          path: 'factoryModel',
          children: [
            {
              title: '区域定义',
              path: 'knowledgeManagement/area-define',
              auth: auth.WEB_VIEW_AREA,
            },
            {
              title: '车间定义',
              path: 'knowledgeManagement/workshop',
              auth: auth.WEB_VIEW_WORKSHOP,
            },
            {
              title: '产线定义',
              path: 'knowledgeManagement/prod-line',
              auth: auth.WEB_VIEW_PRODUCELINE,
            },
            {
              title: '工位定义',
              path: 'knowledgeManagement/workstation',
              auth: auth.WEB_VIEW_WORKSTATION,
            },
            {
              title: '设施定义',
            },
            {
              title: '停机原因',
              path: 'knowledgeManagement/downtimeCauses',
              auth: auth.WEB_VIEW_DOWNTIME_REASON,
            },
            {
              title: '客户',
              path: 'knowledgeManagement/customers',
              auth: auth.WEB_VIEW_CUSTOMER,
            },
            {
              title: '供应商',
              path: 'knowledgeManagement/provider',
              auth: auth.WEB_VIEW_SUPPLIER,
              organizationConfig: [{ key: ORGANIZATION_CONFIG.useQrcode, value: 'true' }],
            },
            {
              title: '单位',
              path: 'knowledgeManagement/units',
              auth: auth.WEB_VIEW_UNIT,
            },
            {
              title: '仓储事务配置',
              path: 'knowledgeManagement/qrCodeAdjustReason',
              auth: auth.WEB_VIEW_INVENTORY_TRANSACTION,
            },
            {
              title: '项目结束原因',
              path: 'knowledgeManagement/finish-cause',
              auth: auth.WEB_PROJECT_FINISH_REASON,
            },
            {
              title: '生产任务延期原因',
              path: 'knowledgeManagement/produceTaskDelayReason',
              auth: auth.WEB_PRODUCE_TASK_DELAY_REASON,
            },
            {
              title: '销售订单结束原因',
              path: 'knowledgeManagement/purchaseOrderFinishReason',
              // auth: auth.WEB_PURCHASE_ORDER_FINISH_REASON,
            },
            {
              title: '电子签名配置',
              path: 'knowledgeManagement/e-signature',
            },
            {
              title: '移动事务',
              path: 'knowledgeManagement/moveTransactions',
              auth: auth.WEB_VIEW_TRANS_TRANSACTION,
              organizationConfig: [{ key: ORGANIZATION_CONFIG.useQrcode, value: 'true' }],
            },
          ],
        },
        {
          title: '基础数据',
          path: 'foundationData',
          children: [
            {
              title: '物料类型',
              path: 'bom/materialTypes',
            },
            {
              title: '物料定义',
              path: 'bom/materials',
              auth: WEB_VIEW_MATERIAL_DEF,
            },
            {
              title: '物料清单',
              path: 'bom/eBom',
              auth: auth.WEB_VIEW_EBOM_DEF,
            },
            {
              title: '工序定义',
              path: 'bom/newProcess',
              auth: auth.WEB_VIEW_PROCESS_DEF,
            },
            {
              title: '工艺路线',
              path: 'bom/processRoute',
              auth: auth.WEB_VIEW_PROCESS_ROUTING_DEF,
            },
            {
              title: '生产BOM',
              path: 'bom/mbom',
              auth: auth.WEB_VIEW_MBOM_DEF,
            },
            {
              title: '嵌套规格定义',
              path: 'knowledgeManagement/nestSpec',
            },
            {
              title: '次品分类',
              path: 'knowledgeManagement/defectCategory',
            },
            {
              title: '次品项',
              path: 'knowledgeManagement/defects',
            },
            {
              title: '电子批记录',
              path: 'knowledgeManagement/batch-template',
              organizationConfig: [{ key: ORGANIZATION_CONFIG.BatchRecord, value: 'true' }],
            },
          ],
        },
        {
          title: '流程引擎',
          path: 'flow-engine',
          organizationConfig: [{ key: ORGANIZATION_CONFIG.SOPConfig, value: 'true' }],
          children: [
            {
              title: 'SOP',
              path: 'knowledgeManagement/sop',
              auth: auth.WEB_SOP_LIST,
              organizationConfig: [{ key: ORGANIZATION_CONFIG.SOPConfig, value: 'true' }],
            },
            {
              title: 'SOP模板',
              path: 'knowledgeManagement/sop-template',
              auth: auth.WEB_SOP_TEMPLATE_LIST,
              organizationConfig: [{ key: ORGANIZATION_CONFIG.SOPConfig, value: 'true' }],
            },
          ],
        },
        {
          title: '仓库建模',
          path: 'storeHouseModeling',
          children: [
            {
              title: '仓库定义',
              path: 'knowledgeManagement/storeHouse',
              auth: auth.WEB_WAREHOUSE_LIST,
            },
            {
              title: '仓位定义',
              path: 'knowledgeManagement/storage',
              auth: auth.WEB_STORAGE_LIST,
            },
            {
              title: '关联仓位',
              path: 'knowledgeManagement/relatedStorage',
              auth: auth.WEB_STORAGE_RELATION_LIST,
            },
          ],
        },
        {
          title: '设备建模',
          path: 'equipmentModeling',
          children: [
            // {
            //   title: '备件定义',
            //   path: 'knowledgeManagement/spareParts',
            // },
            {
              title: '读数定义',
              path: 'knowledgeManagement/metric',
              auth: auth.WEB_VIEW_DEVICE_METRIC,
            },
            {
              title: '维护策略组',
              path: 'knowledgeManagement/maintainStrategy',
              auth: auth.WEB_VIEW_TASK_STRATEGY,
            },
            {
              title: '报告模版',
              path: 'knowledgeManagement/reportTemplate',
              auth: auth.WEB_REPORT_TEMPLATE,
            },
            {
              title: '设备制造商',
              path: 'knowledgeManagement/equipmentManufacturer',
              auth: auth.WEB_EQUIPMENT_MANUFACTURERS,
            },
            {
              title: '设备类型',
              path: 'knowledgeManagement/equipmentType',
              auth: auth.WEB_EQUIPMENT_CATEGORY,
            },
            {
              title: `${customLanguage.equipment_machining_material}`,
              path: 'knowledgeManagement/machiningMaterial',
              auth: auth.WEB_VIEW_MOULD,
            },
            {
              title: '故障原因',
              path: 'knowledgeManagement/faultCauses',
              auth: auth.WEB_FAULT_REASON,
            },
          ],
        },
        {
          title: '质量建模',
          path: 'knowledgeManagement/qualityModeling',
          children: [
            {
              title: '质检项',
              path: 'knowledgeManagement/qcItems',
              auth: auth.WEB_VIEW_QUALITY_TESTING_POINT,
            },
            {
              title: '质检方案',
              path: 'knowledgeManagement/qcConfigs',
            },
            {
              title: '质检项分类',
              path: 'knowledgeManagement/qcItemsGroup',
              auth: auth.WEB_VIEW_QUALITY_TESTING_CATEGORY,
            },
            {
              title: '不良原因字典',
              path: 'knowledgeManagement/qcDefectReason',
            },
            {
              title: '不良等级',
              path: 'knowledgeManagement/qcDefectRank',
              organizationConfig: [{ key: ORGANIZATION_CONFIG.qcDefectRanked, value: 'true' }],
            },
            {
              title: 'AQL',
              path: 'knowledgeManagement/AQL',
            },
          ],
        },
        {
          title: '排产建模',
          path: 'factorySchedule',
          children: [
            {
              title: '标准产能',
              path: 'knowledgeManagement/productivityStandards',
              auth: auth.WEB_VIEW_STANDARD_CAPACITY,
            },
            {
              title: '工作时间',
              auth: auth.WEB_VIEW_WORKING_TIME,
              path: 'knowledgeManagement/workingTime',
            },
            {
              title: '生产日历',
              auth: auth.WEB_VIEW_PRODUCE_CALENDAR,
              path: 'knowledgeManagement/workingCalendar',
            },
            {
              title: '动态准备时间',
              auth: WEB_VIEW_PREPARETION_TIME,
              path: 'knowledgeManagement/preparationTime',
            },
            {
              title: '产能约束',
              path: 'knowledgeManagement/capacityConstraint',
              organizationConfig: [{ key: ORGANIZATION_CONFIG.configScheduleTask, value: '2' }],
            },
          ],
        },
        {
          title: '异常事件',
          path: 'exceptionalEvent',
          children: [
            {
              title: '类型定义',
              path: 'knowledgeManagement/typeDefinition',
            },
            {
              title: '处理标签',
              path: 'knowledgeManagement/handleLabel',
            },
            {
              title: '主题定义',
              path: 'knowledgeManagement/subjectDefinition',
            },
            {
              title: '订阅配置',
              path: 'knowledgeManagement/subscribeManage',
            },
          ],
        },
        {
          title: '文档管理',
          path: 'ducumentManagement',
          organizationConfig: [{ key: ORGANIZATION_CONFIG.configDocumentManagement, value: 'true' }],
          children: [
            {
              title: '文档列表',
              path: 'knowledgeManagement/documents',
            },
            {
              title: '文件夹',
              path: 'knowledgeManagement/folders',
            },
          ],
        },
      ],
    },
    {
      title: '出入厂物流',
      path: 'logistics',
      icon: '_wuliuguanli_Webcelan',
      children: [
        { title: '收货配置', path: 'logistics/receipt-config', auth: auth.WEB_INPUT_FACTORY_CONFIG },
        { title: '发运配置', path: 'logistics/send-config', auth: auth.WEB_OUTPUT_FACTORY_CONFIG },
        { title: '发运任务', path: 'logistics/send-task', auth: auth.WEB_SHIPPING_TASK },
        { title: '收货任务', path: 'logistics/receipt-task', auth: auth.WEB_RECEIVE_TASK },
        { title: '发运破损', path: 'logistics/send-broken-log', auth: auth.WEB_OUTPUT_DAMAGE_REASON },
        {
          title: '收货破损',
          path: 'logistics/receipt-broken-log',
          auth: auth.WEB_INPUT_DAMAGE_REASON,
        },
        {
          title: '数据报表',
          path: 'datagram',
          children: [
            {
              title: '收货物料统计报表',
              path: 'logistics/receipt-datagram',
              auth: auth.WEB_RECEIVE_TASK_MATERIAL_REPORT,
            },
            {
              title: '分拣统计报表',
              path: 'logistics/pick-statistics-datagram',
              auth: auth.WEB_PICKING_TASK_EFFICIENCY_REPORT,
            },
          ],
        },
      ],
    },
    {
      title: '系统配置',
      path: 'config',
      icon: '_xitongpeizhi_Webcelan',
      children: [
        {
          title: '自定义规则',
          path: 'customRule/list',
          auth: auth.WEB_DEF_FIFO_RULE,
        },
        {
          title: '自定义编码',
          path: 'customCode/list',
          auth: auth.WEB_DEF_BATCHNO,
        },
        {
          title: '用户和用户组',
          path: 'usersAndUserGroup',
          children: [
            {
              title: '用户管理',
              path: 'authority/users',
              auth: auth.WEB_USER,
            },
            {
              title: '用户组管理',
              path: 'authority/usergroup',
              auth: auth.WEB_WORKGROUP,
            },
          ],
        },
        {
          title: '角色和权限',
          path: 'authority/roles',
          auth: auth.WEB_USER_ROLE,
        },
        {
          title: '系统参数',
        },
        {
          title: '自定义字段',
          path: 'customProperty',
          children: [
            {
              title: '物料',
              path: 'customProperty/material',
            },
            {
              title: '销售订单',
              path: 'customProperty/saleOrder',
              auth: WEB_PURCHASE_CUSTOM_FIELD,
            },
            {
              title: '计划工单',
              path: 'customProperty/workOrder',
              organizationConfig: [{ key: ORGANIZATION_CONFIG.taskDispatchType, value: 'manager' }],
              auth: WEB_PURCHASE_CUSTOM_FIELD,
            },
          ],
        },
        {
          title: '自定义话术',
          path: 'customLanguage',
        },
      ],
    },
    {
      // graphql有一个关于config的配置，目前disable了
      title: '数据同步',
      icon: 'shujutongbu',
      path: 'dataSync',
      disable: true,
      organizationConfig: [{ key: ORGANIZATION_CONFIG.erpSync, value: true }],
      children: [
        {
          title: '项目同步',
          path: 'dataSync/productOrderSync',
        },
        {
          title: '物料同步',
          path: 'dataSync/materialSync',
        },
      ],
    },
    {
      title: '电子标签',
      path: 'electronicTag',
      icon: 'dianzibiaoqian_Web',
      children: [
        {
          title: '标签模板',
          path: 'electronicTag/template',
        },
        {
          title: '成品条码标签规则',
          path: 'electronicTag/ruleDefinition',
        },
        {
          title: '成品条码标签打印',
          path: 'electronicTag/print',
        },
      ],
    },
    {
      title: '意见与反馈',
    },
  ];
};

// 将子级需要的权限挂在父级上
export const genParentAuth = data => {
  if (!Array.isArray(data)) return;
  return _.cloneDeep(data).map(item => {
    const { children, auth } = item || {};

    item.auth = auth ? [auth] : [];

    if (Array.isArray(children)) {
      item.children = genParentAuth(children);

      item.children.forEach(child => {
        const { auth } = child || {};
        if (auth) {
          item.auth = item.auth.concat(auth);
        }
      });
    }

    return item;
  });
};

/**
 * @description: 判断当前配置是否存在于localStorage的配置中。
 *
 * @date: 2019/5/28 下午3:58
 */
const isOrganizationContainer = data => {
  const _configs = getOrganizationConfigFromLocalStorage();

  if (!Array.isArray(data)) return false;

  let resLen = 0;
  data.forEach(i => {
    const { key, value } = i || {};
    if (_configs && i && _configs[key]) {
      const configValue = _configs[key].configValue;
      // 如果value是数组说明是或的关系
      if (Array.isArray(value) && value.includes(configValue)) {
        resLen += 1;
      } else if (value === configValue) {
        resLen += 1;
      }
    }
  });

  return resLen === data.length;
};

/**
 * @description: 根据权限和工厂配置过滤数据。
 *
 * 叶子节点：
 *
 * 如果没有path过滤
 * 如果disabled过滤
 * 用户没有对应权限
 * 工厂配置不符合要求
 *
 * 非叶子节点：
 *
 * 如果是非叶子节点，子节点为空(不符合上述条件)过滤
 *
 *
 * 不用authWrapper组件来在渲染组件的时候做这件事，是因为对数据的处理比对组件的处理要容易。
 * 举例来说：当需要根据是否有子节点来决定是否显示父节点的时候，如果在render组件的时候做这件事就很麻烦
 *
 *
 * @date: 2019/5/28 下午3:01
 */
export const filterMenuDataByOrganizationConfigAndAuth = menuData => {
  if (arrayIsEmpty(menuData)) return null;

  // 当前工厂的配置和权限
  const _configs = getOrganizationConfigFromLocalStorage(); // 不是数组
  const _auth = getAuthFromLocalStorage();

  const dfs = data => {
    if (!Array.isArray(data)) return null;

    return data
      .map(i => {
        const { children, path, auth, organizationConfig, disabled } = i || {};

        // 如果没有path返回空
        if (!path) return null;

        // 如果disabled返回空
        if (disabled) return null;

        // 如果没有权限返回空
        if (!arrayIsEmpty(_auth) && auth && !_auth.includes(auth)) {
          return null;
        }

        // 如果没有需要的工厂配置返回空
        if (!arrayIsEmpty(organizationConfig) && _configs && !isOrganizationContainer(organizationConfig)) {
          return null;
        }

        // 叶子节点返回
        if (!children) return i;

        // 非叶子节点
        let _children = dfs(children);
        if (Array.isArray(_children)) {
          _children = _children.filter(i => i);
        }

        // 如果没有子节点。那么不返回父节点
        if (children && arrayIsEmpty(_children)) return null;

        return {
          ...i,
          children: _children,
        };
      })
      .filter(i => i);
  };

  return dfs(menuData);
};
