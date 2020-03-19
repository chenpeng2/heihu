import { FIELDS } from 'src/constants';
import LocalStorage from 'src/utils/localStorage';

const auth = {
  WEB_STOCK_LEVEL_REPORT: 'WEB_STOCK_LEVEL_REPORT', // 物料水位报表
  WEB_STOCK_PERIOD_REPORT: 'WEB_STOCK_PERIOD_REPORT', // 物料存放时间表报
  WEB_STOCK_DAILY_BALANCE_REPORT: 'WEB_STOCK_DAILY_BALANCE_REPORT', // 物料日结存报表
  WEB_STOCK_CURRENT_REPORT: 'WEB_STOCK_CURRENT_REPORT', // 物料库存报表
  WEB_PROD_CAPACITY_USE_REPORT: 'WEB_PROD_CAPACITY_USE_REPORT', // 产能利用率报表
  WEB_PROD_PLAN_COMPLETION_REPORT: 'WEB_PROD_PLAN_COMPLETION_REPORT', // 计划达成率报表
  WEB_PROD_STATUS_REPORT: 'WEB_PROD_STATUS_REPORT', // 生产状态报表
  WEB_PROD_CAPABILITY_REPORT: 'WEB_PROD_CAPABILITY_REPORT', // 产能报表
  WEB_PROD_PROGRESS_REPORT: 'WEB_PROD_PROGRESS_REPORT', // 生产进度报表
  WEB_PROD_CURRENT_PRODUCTION_REPORT: 'WEB_PROD_CURRENT_PRODUCTION_REPORT', // 当日产量统计报表
  WEB_PROD_HIST_PRORUCTION_REPORT: 'WEB_PROD_HIST_PRORUCTION_REPORT', // 历史产量统计报表
  WEB_PROD_PRODUCTION_REPORT: 'WEB_PROD_PRODUCTION_REPORT', // 产量统计报表
  WEB_ORGANIZATION: 'WEB_ORGANIZATION', // 工厂
  WEB_EDIT_ROLE: 'WEB_EDIT_ROLE', // 管理角色及权限
  WEB_ROLE: 'WEB_ROLE', // 角色
  WEB_EDIT_AUTHORITY: 'WEB_EDIT_AUTHORITY', // 管理权限的角色
  WEB_AUTHORITY: 'WEB_AUTHORITY', // 权限
  WEB_OPERATION: 'WEB_OPERATION', // 运营
  WEB_EDIT_WORKGROUP: 'WEB_EDIT_WORKGROUP', // 管理用户组及用户
  WEB_WORKGROUP: 'WEB_WORKGROUP', // 用户组
  WEB_EDIT_USER_ROLE: 'WEB_EDIT_USER_ROLE', // 管理角色的用户
  WEB_USER_ROLE: 'WEB_USER_ROLE', // 角色
  WEB_EDIT_USER: 'WEB_EDIT_USER', // 用户管理
  WEB_USER: 'WEB_USER', // 用户
  WEB_USER_AUTHORITY: 'WEB_USER_AUTHORITY', // 权限
  WEB_POSITION: 'WEB_POSITION', // 仓位
  WEB_WORKSTATION: 'WEB_WORKSTATION', // 工位
  WEB_VIEW_DOWNTIME_REASON: 'WEB_VIEW_DOWNTIME_REASON', // 浏览停产原因
  WEB_EDIT_DOWNTIME_REASON: 'WEB_EDIT_DOWNTIME_REASON', // 编辑停产原因
  WEB_CREATE_DOWNTIME_REASON: 'WEB_CREATE_DOWNTIME_REASON', // 创建停产原因
  WEB_VIEW_CUSTOMER: 'WEB_VIEW_CUSTOMER', // 浏览客户
  WEB_EDIT_CUSTOMER: 'WEB_EDIT_CUSTOMER', // 编辑客户
  WEB_CREATE_CUSTOMER: 'WEB_CREATE_CUSTOMER', // 创建客户
  WEB_VIEW_QUALITY_TESTING_CONCERN: 'WEB_VIEW_QUALITY_TESTING_CONCERN', // 浏览关注点
  WEB_EDIT_QUALITY_TESTING_CONCERN: 'WEB_EDIT_QUALITY_TESTING_CONCERN', // 编辑质检关注点
  WEB_CREATE_QUALITY_TESTING_CONCERN: 'WEB_CREATE_QUALITY_TESTING_CONCERN', // 创建质检关注点
  WEB_VIEW_QUALITY_TESTING_CATEGORY: 'WEB_VIEW_QUALITY_TESTING_CATEGORY', // 浏览质检项分类
  WEB_CREATE_QUALITY_TESTING_CATEGORY: 'WEB_CREATE_QUALITY_TESTING_CATEGORY', // 创建质检项分类
  WEB_EDIT_QUALITY_TESTING_CATEGORY: 'WEB_EDIT_QUALITY_TESTING_CATEGORY', // 编辑质检项分类
  WEB_DELETE_QUALITY_TESTING_CATEGORY: 'WEB_DELETE_QUALITY_TESTING_CATEGORY', // 删除质检项分类
  WEB_VIEW_UNIT: 'WEB_VIEW_UNIT', // 浏览单位
  WEB_EDIT_UNIT: 'WEB_EDIT_UNIT', // 编辑单位
  WEB_CREATE_UNIT: 'WEB_CREATE_UNIT', // 创建单位
  WEB_CREATE_UNIT_CONVERSION: 'WEB_CREATE_UNIT_CONVERSION', // 创建转换单位
  WEB_EDIT_UNIT_CONVERSION: 'WEB_EDIT_UNIT_CONVERSION', // 编辑转换单位
  WEB_VIEW_UNIT_CONVERSION: 'WEB_VIEW_UNIT_CONVERSION', // 浏览转换单位
  WEB_VIEW_QUALITY_TESTING: 'WEB_VIEW_QUALITY_TESTING', // 浏览质检方案
  WEB_EDIT_QUALITY_TESTING: 'WEB_EDIT_QUALITY_TESTING', // 编辑质检方案
  WEB_CREATE_QUALITY_TESTING: 'WEB_CREATE_QUALITY_TESTING', // 创建质检方案
  WEB_VIEW_QUALITY_TESTING_TEMPLATE: 'WEB_VIEW_QUALITY_TESTING_TEMPLATE', // 浏览质检方案模板
  WEB_EDIT_QUALITY_TESTING_TEMPLATE: 'WEB_EDIT_QUALITY_TESTING_TEMPLATE', // 编辑质检方案模板
  WEB_CREATE_QUALITY_TESTING_TEMPLATE: 'WEB_CREATE_QUALITY_TESTING_TEMPLATE', // 创建质检方案模板
  WEB_VIEW_QUALITY_TESTING_POINT: 'WEB_VIEW_QUALITY_TESTING_POINT', // 浏览质检项
  WEB_EDIT_QUALITY_TESTING_POINT: 'WEB_EDIT_QUALITY_TESTING_POINT', // 编辑质检项
  WEB_CREATE_QUALITY_TESTING_POINT: 'WEB_CREATE_QUALITY_TESTING_POINT', // 创建质检项
  WEB_VIEW_MBOM_DEF: 'WEB_VIEW_MBOM_DEF', // 浏览生产 BOM 定义
  WEB_EDIT_MBOM_DEF: 'WEB_EDIT_MBOM_DEF', // 编辑生产 BOM 定义
  WEB_CREATE_MBOM_DEF: 'WEB_CREATE_MBOM_DEF', // 创建生产 BOM 定义
  WEB_VIEW_EBOM_DEF: 'WEB_VIEW_EBOM_DEF', // 浏览物料清单定义
  WEB_EDIT_EBOM_DEF: 'WEB_EDIT_EBOM_DEF', // 编辑物料清单定义
  WEB_CREATE_EBOM_DEF: 'WEB_CREATE_EBOM_DEF', // 创建物料清单定义
  WEB_VIEW_PROCESS_ROUTING_DEF: 'WEB_VIEW_PROCESS_ROUTING_DEF', // 浏览工艺路线定义
  WEB_EDIT_PROCESS_ROUTING_DEF: 'WEB_EDIT_PROCESS_ROUTING_DEF', // 编辑工艺路线定义
  WEB_CREATE_PROCESS_ROUTING_DEF: 'WEB_CREATE_PROCESS_ROUTING_DEF', // 创建工艺路线定义
  WEB_VIEW_PROCESS_DEF: 'WEB_VIEW_PROCESS_DEF', // 浏览工序定义
  WEB_EDIT_PROCESS_DEF: 'WEB_EDIT_PROCESS_DEF', // 编辑工序定义
  WEB_CREATE_PROCESS_DEF: 'WEB_CREATE_PROCESS_DEF', // 创建工序定义
  WEB_VIEW_MATERIAL_DEF: 'WEB_VIEW_MATERIAL_DEF', // 浏览物料定义
  WEB_EDIT_MATERIAL_DEF: 'WEB_EDIT_MATERIAL_DEF', // 编辑物料定义
  WEB_CREATE_MATERIAL_DEF: 'WEB_CREATE_MATERIAL_DEF', // 创建物料定义
  WEB_FAULT_REASON: 'WEB_FAULT_REASON', // 管理故障原因
  WEB_MOULD_CATEGORY: 'WEB_MOULD_CATEGORY', // 管理模具类型
  WEB_EQUIPMENT_CATEGORY: 'WEB_EQUIPMENT_CATEGORY', // 管理设备类型
  WEB_REPORT_TEMPLATE: 'WEB_REPORT_TEMPLATE', // 管理报告模板
  WEB_EQUIPMENT_MANUFACTURERS: 'WEB_EQUIPMENT_MANUFACTURERS', // 管理设备制造商
  WEB_REMOVE_MOULD: 'WEB_REMOVE_MOULD', // 删除模具
  WEB_EDIT_MOULD: 'WEB_EDIT_MOULD', // 编辑模具
  WEB_VIEW_MOULD: 'WEB_VIEW_MOULD', // 浏览模具
  WEB_ADD_MOULD: 'WEB_ADD_MOULD', // 添加模具
  WEB_REMOVE_EQUIPMENT: 'WEB_REMOVE_EQUIPMENT', // 删除设备
  WEB_EDIT_EQUIPMENT: 'WEB_EDIT_EQUIPMENT', // 编辑设备
  WEB_VIEW_EQUIPMENT: 'WEB_VIEW_EQUIPMENT', // 浏览设备
  WEB_ADD_EQUIPMENT: 'WEB_ADD_EQUIPMENT', // 添加设备
  APP_PERFORM_REPAIR_TASK: 'APP_PERFORM_REPAIR_TASK', // 执行维修任务
  WEB_REMOVE_REPAIR_TASK: 'WEB_REMOVE_REPAIR_TASK', // 删除维修任务
  WEB_EDIT_REPAIR_TASK: 'WEB_EDIT_REPAIR_TASK', // 编辑维修任务
  APP_APPLY_REPAIR_TASK: 'APP_APPLY_REPAIR_TASK', // 创建维修任务（需审核）
  APP_CREATE_REPAIR_TASK: 'APP_CREATE_REPAIR_TASK', // 创建维修任务
  WEB_CREATE_REPAIR_TASK: 'WEB_CREATE_REPAIR_TASK', // 创建维修任务
  WEB_VIEW_REPAIR_TASK: 'WEB_VIEW_REPAIR_TASK', // 浏览维修任务
  APP_PERFORM_MAINTAIN_TASK: 'APP_PERFORM_MAINTAIN_TASK', // 执行保养任务
  WEB_REMOVE_MAINTAIN_TASK: 'WEB_REMOVE_MAINTAIN_TASK', // 删除保养任务
  WEB_EDIT_MAINTAIN_TASK: 'WEB_EDIT_MAINTAIN_TASK', // 编辑保养任务
  WEB_CREATE_MAINTAIN_TASK: 'WEB_CREATE_MAINTAIN_TASK', // 创建保养任务
  WEB_VIEW_MAINTAIN_TASK: 'WEB_VIEW_MAINTAIN_TASK', // 浏览保养任务
  APP_PERFORM_CHECK_TASK: 'APP_PERFORM_CHECK_TASK', // 执行点检任务
  WEB_REMOVE_CHECK_TASK: 'WEB_REMOVE_CHECK_TASK', // 删除点检任务
  WEB_EDIT_CHECK_TASK: 'WEB_EDIT_CHECK_TASK', // 编辑点检任务
  WEB_CREATE_CHECK_TASK: 'WEB_CREATE_CHECK_TASK', // 创建点检任务
  WEB_VIEW_CHECK_TASK: 'WEB_VIEW_CHECK_TASK', // 浏览点检任务
  WEB_ASSIGN_QUALITY_TESTING_TASK: 'WEB_ASSIGN_QUALITY_TESTING_TASK', // 派发质检任务
  WEB_CREATE_QUALITY_TESTING_TASK: 'WEB_CREATE_QUALITY_TESTING_TASK', // 创建质检任务
  WEB_VIEW_QUALITY_TESTING_TASK: 'WEB_VIEW_QUALITY_TESTING_TASK', // 浏览质检任务
  WEB_EDIT_QUALITY_TESTING_TASK: 'WEB_EDIT_QUALITY_TESTING_TASK', // 编辑质检任务
  WEB_CANCEL_QUALITY_TESTING_TASK: 'WEB_CANCEL_QUALITY_TESTING_TASK', // 取消质检任务
  APP_PERFORM_QUALITY_TESTING_TASK: 'APP_PERFORM_QUALITY_TESTING_TASK', // 执行质检任务
  APP_VIEW_QUALITY_TESTING_TASK: 'APP_VIEW_QUALITY_TESTING_TASK', // 浏览质检任务
  APP_EDIT_QUALITY_TESTING_TASK: 'APP_EDIT_QUALITY_TESTING_TASK', // 编辑质检任务
  APP_ASSIGN_QUALITY_TESTING_TASK: 'APP_ASSIGN_QUALITY_TESTING_TASK', // 派发质检任务
  APP_CREATE_QUALITY_TESTING_TASK: 'APP_CREATE_QUALITY_TESTING_TASK', // 创建质检任务
  APP_DELIVERY_HISTORY_TRACE: 'APP_DELIVERY_HISTORY_TRACE', // 出厂追溯
  APP_HISTORY_TRACE: 'APP_HISTORY_TRACE', // 追溯模块
  WEB_DELIVERY_HISTORY_TRACE: 'WEB_DELIVERY_HISTORY_TRACE', // 出厂追溯
  WEB_HISTORY_TRACE: 'WEB_HISTORY_TRACE', // 追溯模块
  WEB_VIEW_PACKAGE_RECORD: 'WEB_VIEW_PACKAGE_RECORD', // 装箱列表
  WEB_VIEW_ADMIT_RECORD: 'WEB_VIEW_ADMIT_RECORD', // 查看入厂记录
  WEB_VIEW_DELIVER_RECORD: 'WEB_VIEW_DELIVER_RECORD', // 查看出厂记录
  WEB_VIEW_MANUFACTURE_MATERIAL: 'WEB_VIEW_MANUFACTURE_MATERIAL', // 查看生产物料
  WEB_VIEW_MATERIAL: 'WEB_VIEW_MATERIAL', // 查看厂内物料
  WEB_MATERIAL: 'WEB_MATERIAL', // 物料管理
  APP_PICKUP_PACKAGE: 'APP_PICKUP_PACKAGE', // 装箱
  APP_MATERIAL_ADMIT: 'APP_MATERIAL_ADMIT', // 入厂
  APP_MATERIAL_DELIVER: 'APP_MATERIAL_DELIVER', // 出厂
  APP_MATERIAL_OUT: 'APP_MATERIAL_OUT', // 出库
  APP_MATERIAL_IN: 'APP_MATERIAL_IN', // 入库
  APP_MATERIAL: 'APP_MATERIAL', // 物料管理
  APP_PRODUCE_TASK: 'APP_PRODUCE_TASK', // 生产任务列表
  APP_CLAIM_PRODUCT_TASK: 'APP_CLAIM_PRODUCT_TASK', // 领取生产任务
  WEB_UPDATE_DISTRIBUTE_PROGRESS: 'WEB_UPDATE_DISTRIBUTE_PROGRESS', // 更新配送进度
  WEB_ABORT_PROCURE_ORDER: 'WEB_ABORT_PROCURE_ORDER', // 取消采购清单
  WEB_VIEW_PROCURE_ORDER: 'WEB_VIEW_PROCURE_ORDER', // 查看采购清单
  WEB_EDIT_PROCURE_ORDER: 'WEB_EDIT_PROCURE_ORDER', // 编辑采购清单
  WEB_CREATE_PROCURE_ORDER: 'WEB_CREATE_PROCURE_ORDER', // 创建采购清单
  WEB_PROCURE_IN_FACTORY: 'WEB_PROCURE_IN_FACTORY', // 采购清单物料入厂
  WEB_PRINT_PROCURE_IN_FACTORY_TAG: 'WEB_PRINT_PROCURE_IN_FACTORY_TAG', // 打印采购清单物料入厂标签
  WEB_VIEW_WORKSTATION_SCHEDULES: 'WEB_VIEW_WORKSTATION_SCHEDULES', // 浏览工位排程看板
  WEB_VIEW_PRODUCE_TASK: 'WEB_VIEW_PRODUCE_TASK', // 浏览生产任务
  WEB_EDIT_PRODUCE_TASK: 'WEB_EDIT_PRODUCE_TASK', // 编辑生产任务
  WEB_ASSIGN_PRODUCE_TASK: 'WEB_ASSIGN_PRODUCE_TASK', // 派发生产任务
  WEB_CREATE_PRODUCE_TASK: 'WEB_CREATE_PRODUCE_TASK', // 创建生产任务（派发方式配置为 1）
  WEB_VIEW_WORKSTATION_SCHEDULE: 'WEB_VIEW_WORKSTATION_SCHEDULE', // 浏览工位排程
  WEB_VIEW_ASSIGNED_PROJECT: 'WEB_VIEW_ASSIGNED_PROJECT', // 浏览已下发的项目
  WEB_VIEW_UNASSIGNED_PROJECT: 'WEB_VIEW_UNASSIGNED_PROJECT', // 浏览未下发项目
  WEB_START_PROJECT: 'WEB_START_PROJECT', // 开始项目
  WEB_EDIT_PROJECT: 'WEB_EDIT_PROJECT', // 编辑项目
  WEB_ASSIGN_PROJECT: 'WEB_ASSIGN_PROJECT', // 下发项目
  WEB_SCHEDULE_PROJECT: 'WEB_SCHEDULE_PROJECT', // 排程项目
  WEB_CONFIRM_PROJECT: 'WEB_CONFIRM_PROJECT', // 确认项目
  WEB_VIEW_PROJECT: 'WEB_VIEW_PROJECT', // 浏览项目
  WEB_CREATE_PROJECT: 'WEB_CREATE_PROJECT', // 创建项目
  WEB_VIEW_PURCHASE_ORDER: 'WEB_VIEW_PURCHASE_ORDER', // 浏览销售订单
  WEB_UPDATE_PURCHASE_ORDER: 'WEB_UPDATE_PURCHASE_ORDER', // 编辑销售订单
  WEB_CREATE_PURCHASE_ORDER: 'WEB_CREATE_PURCHASE_ORDER', // 创建销售订单
  WEB_FINISH_PURCHASE_ORDER: 'WEB_FINISH_PURCHASE_ORDER', // 结束销售订单
  WEB_DELETE_PURCHASE_ORDER: 'WEB_DELETE_PURCHASE_ORDER', // 删除销售订单
  WEB_PURCHASE_ORDER_FINISH_REASON: 'WEB_PURCHASE_ORDER_FINISH_REASON', // 维护销售订单结束原因
  WEB_VIEW_PLAN_WORK_ORDER: 'WEB_VIEW_PLAN_WORK_ORDER', // 浏览计划工单
  WEB_EDIT_PLAN_WORK_ORDER: 'WEB_EDIT_PLAN_WORK_ORDER', // 编辑计划工单
  APP_CREATE_PRODUCE_TASK: 'APP_CREATE_PRODUCE_TASK', // 创建生产任务
  WEB_EDIT_PLAN_TASK: 'WEB_EDIT_PLAN_TASK', // 编辑计划生产任务
  WEB_VIEW_PLAN_TASK: 'WEB_VIEW_PLAN_TASK', // 浏览计划生产任务
  WEB_SALES_ORDER_DELIVERY_REPORT: 'WEB_SALES_ORDER_DELIVERY_REPORT', // 订单交货报表
  WEB_VIEW_PROD_REPORT: 'WEB_VIEW_PROD_REPORT', // 浏览生产报表
  WEB_VIEW_MATERIAL_AMOUNT: 'WEB_VIEW_MATERIAL_AMOUNT', // 浏览物料现有量
  WEB_VIEW_WORKING_TIME: 'WEB_VIEW_WORKING_TIME', // 查看工作时间
  WEB_VIEW_PRODUCE_CALENDAR: 'WEB_VIEW_PRODUCE_CALENDAR', // 查看生产日历
  WEB_VIEW_WORKSHOP: 'WEB_VIEW_WORKSHOP', // 查看车间
  WEB_VIEW_PRODUCELINE: 'WEB_VIEW_PRODUCELINE', // 查看产线
  WEB_VIEW_WORKSTATION: 'WEB_VIEW_WORKSTATION', // 查看工位
  WEB_VIEW_AREA: 'WEB_VIEW_AREA', // 查看区域
  WEB_VIEW_STANDARD_CAPACITY: 'WEB_VIEW_STANDARD_CAPACITY', // 浏览标准产能
  WEB_VIEW_PROJECT_SCHEDULE: 'WEB_VIEW_PROJECT_SCHEDULE', // 浏览项目排程
  WEB_VIEW_SUPPLIER: 'WEB_VIEW_SUPPLIER', // 查看供应商
  WEB_VIEW_MATERIAL_LOT_OF_QRCODE: 'WEB_VIEW_MATERIAL_LOT_OF_QRCODE', // 查询二维码
  WEB_VIEW_INVENTORY: 'WEB_VIEW_INVENTORY', // 库存查询
  WEB_WAREHOUSE_CREATE: 'WEB_WAREHOUSE_CREATE', // 创建仓库
  WEB_WAREHOUSE_UPDATE: 'WEB_WAREHOUSE_UPDATE', // 编辑仓库
  WEB_WAREHOUSE_LIST: 'WEB_WAREHOUSE_LIST', // 查看仓库
  WEB_STORAGE_CREATE: 'WEB_STORAGE_CREATE', // 创建子仓位
  WEB_STORAGE_UPDATE: 'WEB_STORAGE_UPDATE', // 编辑仓位
  WEB_STORAGE_LIST: 'WEB_STORAGE_LIST', // 查看仓位
  WEB_RELATION_STORAGE_ADD: 'WEB_RELATION_STORAGE_ADD', // 添加仓位
  WEB_RELATION_STORAGE_UPDATE: 'WEB_RELATION_STORAGE_UPDATE', // 编辑仓位
  WEB_STORAGE_RELATION_LIST: 'WEB_STORAGE_RELATION_LIST', // 查看关联仓位
  WEB_VIEW_INVENTORY_TRANSACTION: 'WEB_VIEW_INVENTORY_TRANSACTION', // 仓储事务配置
  WEB_OUTPUT_FACTORY_CONFIG: 'WEB_OUTPUT_FACTORY_CONFIG', // 发运配置
  WEB_SHIPPING_TASK: 'WEB_SHIPPING_TASK', // 发运任务
  WEB_OUTPUT_DAMAGE_REASON: 'WEB_OUTPUT_DAMAGE_REASON', // 发运破损
  WEB_SHIPPING_TASK_EDIT: 'WEB_SHIPPING_TASK_EDIT', // 发运任务编辑
  WEB_INPUT_FACTORY_CONFIG: 'WEB_INPUT_FACTORY_CONFIG', // 收货配置
  WEB_RECEIVE_TASK: 'WEB_RECEIVE_TASK', // 收货任务
  WEB_INPUT_DAMAGE_REASON: 'WEB_INPUT_DAMAGE_REASON', // 收货破损
  WEB_RECEIVE_TASK_EDIT: 'WEB_RECEIVE_TASK_EDIT', // 收货任务编辑
  WEB_QUALITY_REPORT: 'WEB_QUALITY_REPORT', // 质检任务
  WEB_PROD_CYCLE_TIME_REPORT: 'WEB_PROD_CYCLE_TIME_REPORT', // 生产工时报表
  WEB_RECEIVE_TASK_MATERIAL_REPORT: 'WEB_RECEIVE_TASK_MATERIAL_REPORT', // 收货物料统计
  WEB_PICKING_TASK_EFFICIENCY_REPORT: 'WEB_PICKING_TASK_EFFICIENCY_REPORT', // 分拣计划报表
  WEB_PROD_MATERIAL_CONSUMPTION_REPORT: 'WEB_PROD_MATERIAL_CONSUMPTION_REPORT', // 生产投产物料统计报表
  WEB_CREATE_PLAN_TASK: 'WEB_CREATE_PLAN_TASK', // 能否排程
  WEB_DISTRIBUTE_PLAN_TASK: 'WEB_DISTRIBUTE_PLAN_TASK', // 下发
  WEB_CREATE_PLAN_WORK_ORDER: 'WEB_CREATE_PLAN_WORK_ORDER', // 创建计划工单
  WEB_CANCEL_PLAN_WORK_ORDER: 'WEB_CANCEL_PLAN_WORK_ORDER', // 取消计划工单
  WEB_AUDIT_PLAN_WORK_ORDER: 'WEB_AUDIT_PLAN_WORK_ORDER', // 审批计划工单
  WEB_AUDIT_MANUFACTURE_TASK: 'WEB_AUDIT_MANUFACTURE_TASK', // 生产任务审批
  WEB_PROJECT_FINISH_REASON: 'WEB_PROJECT_FINISH_REASON', // 项目结束原因
  WEB_CANCEL_PROJECT: 'WEB_CANCEL_PROJECT', // 取消项目
  WEB_FINISH_PROJECT: 'WEB_FINISH_PROJECT', // 结束项目
  WEB_PAUSE_PROJECT: 'WEB_PAUSE_PROJECT', // 暂停项目,
  WEB_VIEW_TRALLYING_RECORD: 'WEB_VIEW_TRALLYING_RECORD', // 盘点记录查询
  WEB_PRODUCE_TASK_DELAY_REASON: 'WEB_PRODUCE_TASK_DELAY_REASON', // 生产任务延期原因
  WEB_VIEW_TASK_STRATEGY: 'WEB_VIEW_TASK_STRATEGY', // 查看维护策略
  WEB_ENABLE_TASK_STRATEGY: 'WEB_ENABLE_TASK_STRATEGY', // 停用设备中的策略
  WEB_DISABLE_TASK_STRATEGY: 'WEB_DISABLE_TASK_STRATEGY', // 启用设备中的策略
  WEB_VIEW_MATERIAL_REQUEST: 'WEB_VIEW_MATERIAL_REQUEST', // 物料请求
  WEB_VIEW_DEVICE_METRIC: 'WEB_VIEW_DEVICE_METRIC', // 查看读数
  WEB_DELIVERY_REQUEST_MANAGEMENT: 'WEB_DELIVERY_REQUEST_MANAGEMENT', // 发运申请权限
  WEB_DELIVERY_REQUEST_ISSUE: 'WEB_DELIVERY_REQUEST_ISSUE', // 发运申请下发权限
  WEB_CONFIG_E_SIGNATURE: 'WEB_CONFIG_E_SIGNATURE', // 配置电子签名
  WEB_CONFIG_LABEL_TEMPLATE: 'WEB_CONFIG_LABEL_TEMPLATE', // 配置标签模板
  WEB_SOP_LIST: 'WEB_SOP_LIST', // 浏览SOP
  WEB_SOP_CREATE: 'WEB_SOP_CREATE', // 创建sop
  WEB_SOP_TASK_LIST: 'WEB_SOP_TASK_LIST', // 浏览sop任务
  WEB_VIEW_TRANSFER_RECORD: 'WEB_VIEW_TRANSFER_RECORD', // 出入库记录查询
  WEB_CHANGE_DEVICE_CALIBRATION_VALID_TIME: 'WEB_CHANGE_DEVICE_CALIBRATION_VALID_TIME', // 配置设备效期
  WEB_EDIT_CUSTOM_LANGUAGE: 'WEB_EDIT_CUSTOM_LANGUAGE', // 自定义话术
  WEB_MANAGE_WEIGH_CONFIG: 'WEB_MANAGE_WEIGH_CONFIG', // 管理称量基础数据配置
  WEB_MANAGE_WEIGH_TASK: 'WEB_MANAGE_WEIGH_TASK', // 管理称量任务
  WEB_OPERATE_WEIGH_TASK: 'WEB_OPERATE_WEIGH_TASK', // 执行称量任务
  WEB_ADD_PLAN_DOWNTIME: 'WEB_ADD_PLAN_DOWNTIME', // 添加计划停机
  WEB_EDIT_PLAN_DOWNTIME: 'WEB_EDIT_PLAN_DOWNTIME', // 修改计划停机
  WEB_DEL_PLAN_DOWNTIME: 'WEB_DEL_PLAN_DOWNTIME', // 删除计划停机
  WEB_ADD_ACTUAL_DOWNTIME: 'WEB_ADD_ACTUAL_DOWNTIME', // 添加实际停机
  WEB_EDIT_ACTUAL_DOWNTIME: 'WEB_EDIT_ACTUAL_DOWNTIME', // 修改实际停机
  WEB_DEL_ACTUAL_DOWNTIME: 'WEB_DEL_ACTUAL_DOWNTIME', // 删除实际停机
  WEB_VIEW_EQUIPMENT_OVERVIEW: 'WEB_VIEW_EQUIPMENT_OVERVIEW', // 查看设备概览
  WEB_IMPORT_INIT_MATERIAL_LOT: 'WEB_IMPORT_INIT_MATERIAL_LOT', // 导入二维码
  WEB_VIEW_PREPARETION_TIME: 'WEB_VIEW_PREPARETION_TIME',
  WEB_EDIT_PREPARETION_TIME: 'WEB_EDIT_PREPARETION_TIME',
  WEB_DEF_BATCHNO: 'WEB_DEF_BATCHNO',
  WEB_EMPTY_MATERIAL_LOT: 'WEB_EMPTY_MATERIAL_LOT',
  WEB_DEF_FIFO_RULE: 'WEB_DEF_FIFO_RULE',
  WEB_VIEW_MATERIAL_LOT_SPLIT: 'WEB_VIEW_MATERIAL_LOT_SPLIT',
  WEB_VIEW_INVENTORY_TRANSACTION_LOG: 'WEB_VIEW_INVENTORY_TRANSACTION_LOG', // 仓储事务配置
  WEB_VIEW_TRANS_TRANSACTION: 'WEB_VIEW_TRANS_TRANSACTION', // 移动事务查看及配置
  WEB_VIEW_MATERIAL_LOT_SUMMARY_REPORT: 'WEB_VIEW_MATERIAL_LOT_SUMMARY_REPORT', // 现有量汇总报表
  WEB_VIEW_MATERIAL_TRANSFER_REQUEST_WEB: 'WEB_VIEW_MATERIAL_TRANSFER_REQUEST_WEB', // 转移申请
  WEB_VIEW_INBOUND_ORDER: 'WEB_VIEW_INBOUND_ORDER', // 浏览入库单
  WEB_ADD_TOOLING: 'WEB_ADD_TOOLING', // 添加工装
  WEB_EDIT_TOOLING: 'WEB_EDIT_TOOLING', // 编辑工装
  WEB_VIEW_TOOLING: 'WEB_VIEW_TOOLING', // 浏览工装
  WEB_SCRAP_TOOLING: 'WEB_SCRAP_TOOLING', // 工装报废
  WEB_PURCHASE_CUSTOM_FIELD: 'WEB_PURCHASE_CUSTOM_FIELD', // 销售订单自定义字段
  WEB_VIEW_ADMIT_REVERSE_RECORD: 'WEB_VIEW_ADMIT_REVERSE_RECORD', // 退料记录
  WEB_QUALITY_REPORT_VERIFY: 'WEB_QUALITY_REPORT_VERIFY', // 质检报告审核
  WEB_DEFECT_CREATE: 'WEB_DEFECT_CREATE', // 创建次品项
  WEB_DEFECT_EDIT: 'WEB_DEFECT_EDIT', // 编辑次品项，包括状态更新
  WEB_DEFECT_IMPORT: 'WEB_DEFECT_IMPORT', // 导入次品项
  WEB_DEFECT_GROUP_CREATE: 'WEB_DEFECT_GROUP_CREATE', // 创建次品分类
  WEB_DEFECT_GROUP_EDIT: 'WEB_DEFECT_GROUP_EDIT', // 编辑次品分类，包括状态更新
  WEB_INJECT_MOLD_TASK: 'WEB_INJECT_MOLD_TASK', // 合并生产任务
  WEB_DEFECT_PRODUCTION_REPORT: 'WEB_DEFECT_PRODUCTION_REPORT', // 生产次品报表
  WEB_AUDIT_BATCH_RECORD: 'WEB_AUDIT_BATCH_RECORD', // 审批批记录
  WEB_SOP_TEMPLATE_CREATE: 'WEB_SOP_TEMPLATE_CREATE', // 创建SOP模板
  WEB_SOP_TEMPLATE_LIST: 'WEB_SOP_TEMPLATE_LIST', // 浏览 SOP 模板
  WEB_BULK_SET_PRIOR: 'WEB_BULK_SET_PRIOR', // 生产任务批量标记优先
  WEB_MATERIAL_LOT_MERGE: 'WEB_VIEW_COMBINE_RECORD', // 二维码合并记录
  WEB_VIEW_WATCH_DASHBOARD: 'WEB_VIEW_WATCH_DASHBOARD', // 查看监控台
  WEB_WATCH_CONDITION_OPERATE: 'WEB_WATCH_CONDITION_OPERATE', // 创建&编辑监控条件
  APP_CLAIM_QUALITY_TESTING_TASK: 'APP_CLAIM_QUALITY_TESTING_TASK', // 领取质检任务
};

// 从localStorage中获取auth
export const getAuthFromLocalStorage = () => {
  return LocalStorage.get(FIELDS && FIELDS.AUTH);
};

export const hasAuth = authName => {
  if (!authName) return false;
  return LocalStorage.get(FIELDS.AUTH).includes(authName);
};

export default auth;