import { primary, error, lightGrey } from 'src/styles/color';
import { baseFind } from 'src/utils/object';

// 这个文件中是一些常量配置

export const PROJECT_STATUS = {
  1: '未开始',
  2: '执行中',
  3: '暂停中',
  4: '已结束',
  5: '已取消',
};

export const PURCHASE_LIST_STATUS = {
  s1: '已申请',
  s2: '已完成',
  s3: '已取消',
  s4: '新建',
};

export const VERSION = '0.13';
export const FIELDS = {
  WELCOME_AT: 'welcome_at',
  USER_NAME: 'username',
  TOKEN_NAME: 'token',
  TOKEN_PASSWORD: 'token_password',
  AUTH: 'auth',
  USER_INFO: 'userInfo',
  LOGIN_INFO: 'loginInfo',
  USER: 'USER',
};
export const TITLES = {
  TODAY: '每日任务',
  ORDER: '订单管理',
  METRICS: '实时监督',
};
export const taskStatus = {
  UNASSIGNED: 'unassigned',
  ASSIGNED: 'assigned',
  RUNNING: 'running',
  PAUSED: 'paused',
  DONE: 'done',
  ABORTED: 'aborted',
};
export const taskStatusCh = {
  unassigned: '未分配',
  assigned: '已分配',
  running: '进行中',
  paused: '暂停中',
  done: '已完成',
  aborted: '已废弃',
};
export const lgTaskStatusCh = {
  unready: '未就绪',
  ready: '可转运',
  running: '转运中',
  done: '已结束',
};
export const orderStatus = {
  NEW: 'new',
  RUNNING: 'running',
  PAUSED: 'paused',
  DONE: 'done',
  ABORTED: 'aborted',
};

export const lgUnitStatus = {
  TRANSFERRING: {
    value: 'transferring',
    display: '转运中',
  },
  STORED: {
    value: 'stored',
    display: '仓储中',
  },
  WAITING: {
    value: 'waiting',
    display: '待投产',
  },
  USED: {
    value: 'used',
    display: '已投产',
  },
  DELIVERED: {
    value: 'delivered',
    display: '已出厂',
  },
};

export const MANU_STATUS_GROUP = {
  active: [taskStatus.RUNNING, taskStatus.PAUSED, taskStatus.DONE],
  completed: [taskStatus.DONE],
  uncompleted: [taskStatus.UNASSIGNED, taskStatus.ASSIGNED, taskStatus.RUNNING, taskStatus.PAUSED],
};
export const qcTaskStatus = {
  NEW: 'new',
  RUNNING: 'running',
  DONE: 'done',
};
export const QC_STATUS_GROUP = {
  active: [qcTaskStatus.RUNNING, qcTaskStatus.DONE],
  completed: [qcTaskStatus.DONE],
  uncompleted: [qcTaskStatus.NEW, qcTaskStatus.RUNNING],
};
export const materialQcTaskStatus = {
  NEW: 'new',
  RUNNING: 'running',
  DONE: 'done',
};
export const taskActions = {
  ASSIGN: 'assign',
  START: 'start',
  PAUSE: 'pause',
  RESUME: 'resume',
  FINISH: 'finish',
  ABORT: 'abort',
  REOPEN: 'reopen',
};
export const ORDER_STATUS_LABEL = {
  unassigned: {
    color: 'grey',
    text: '未分配',
  },
  assigned: {
    color: 'blue',
    text: '已分配',
  },
  running: {
    color: 'green',
    text: '进行中',
  },
  paused: {
    color: 'darkgoldenrod',
    text: '暂停中',
  },
  done: {
    color: 'darkgreen',
    text: '已完成',
  },
  aborted: {
    color: 'red',
    text: '已废弃',
  },
};
export const ORDER_ACTION_LABEL = {
  start: {
    color: 'grey',
    text: '开始',
  },
  pause: {
    color: 'grey',
    text: '暂停',
  },
  resume: {
    color: 'grey',
    text: '恢复生产',
  },
  finish: {
    color: 'grey',
    text: '完成',
  },
  abort: {
    color: 'grey',
    text: '废弃',
  },
  reopen: {
    color: 'grey',
    text: '撤销完成状态',
  },
  enter: { color: 'grey', text: '进入' },
};
export const BOM_CATEGORY = {
  raw: '来料',
  semi: '半成品',
  prod: '成品',
};
export const PRODUCTORDER_CREATE = 'productOrder::create';
export const PRODUCTORDER_LIST = 'productOrder::list';
export const PRODUCTORDER_DELETE = 'productOrder::delete';
export const PRODUCTORDER_UPDATE = 'productOrder::update';
export const PRODUCTORDER_MANAGE = 'productOrder::manage';
export const PLAN_CREATE = 'plan::create';
export const PLAN_LIST = 'plan::list';
export const PLAN_DELETE = 'plan::delete';
export const PLAN_UPDATE = 'plan::update';
export const PLAN_MANAGE = 'plan::manage';
export const PURCHASEORDER_CREATE = 'purchaseOrder::create';
export const PURCHASEORDER_LIST = 'purchaseOrder::list';
export const PURCHASEORDER_DELETE = 'purchaseOrder::delete';
export const PURCHASEORDER_UPDATE = 'purchaseOrder::update';
export const PURCHASEORDER_MANAGE = 'purchaseOrder::manage';
export const BOM_CREATE = 'bom::create';
export const BOM_LIST = 'bom::list';
export const BOM_DELETE = 'bom::delete';
export const BOM_UPDATE = 'bom::update';
export const BOM_MANAGE = 'bom::manage';
export const ALL_MANAGE = 'all::manage';
export const TASK_ACTIONS = (status: String) => {
  switch (status) {
    case 'assigned':
      return ['start'];
    case 'running':
      return ['enter', 'pause', 'finish'];
    case 'paused':
      return ['resume', 'finish'];
    case 'closed':
      return ['reopen'];
    default:
      return ['undefined'];
  }
};
export const INFO = (status: String) => {
  const dict = {};
  return dict[status];
};
export const TabsHeaderHeight = 85;
export const BottomButtonHeight = 100;
// web中所有的进度条最大长度
export const ProgressLength = 400;
// bom中每一个节点的子节点最大个数
export const MaxNumberForBomNode = 20;
// 计划号，项目号，任务号缺失提示
export const MaxQRCodeLength = 20; // 二维码最大长度
export const errorMessageForItemNo = '历史数据暂无号码';
export const SortableTreeNodeHeight = 62;

export const MaxRemarkLength = 20; // 备注最大长度
export const MaxpurchaseOrderCodeLength = 25; // 订单号最大长度
export const MaxProjectCodeLength = 25; // 项目号最大长度

// 杠, 一个替换标识。用来表示不显示
export const replaceSign = '-';
// 物料的最长长度
export const MaxMaterialNameLength = 26;
// 物料编码的最大长度
export const MaxMaterialCodeLength = 36;
// 供应商批次号最长长度
export const MaxMfgBatchLength = 28;

// 默认的pageSize
export const DEFAULT_PAGE_SIZE = 10;

// 小数点保留的位数
export const MaxDigits = 6;

// 账号等级
export const ACCOUNT_LEVEL = {
  1: '一级',
  2: '二级',
  3: '三级',
};

export const DEVICE_ENABLE_STATUS = {
  1: '已闲置',
  2: '已启用',
  3: '已报废',
};

export const DEVICE_MAINTAIN = {
  1: '正常',
  2: '停用',
};

export const EBOM_STATUS = {
  0: '停用',
  1: '启用',
};

export const AREA_DEFINE = {
  PRODUCTION_LINE: '产线',
  WORKSTATION: '工位',
  WORKSHOP: '车间',
  ORGANIZATION: '工厂',
};

export const QCTASK_STATUS = {
  0: {
    display: '未开始',
    color: '#e5e5e5',
  },
  1: {
    display: '已开始',
    color: '#2593fc',
  },
  2: {
    display: '已结束',
    color: '#02b980',
  },
  3: {
    display: '已取消',
    color: '#9b9b9b',
  },
};

export const InputCheckCategory = {
  1: '进厂检查',
  2: '离厂检查',
  3: '卸车前检查',
  4: '卸车后检查',
};

export const OutputCheckCategory = {
  1: '进厂检查',
  2: '离厂检查',
  3: '装车前检查',
  4: '装车后检查',
};

export const ReceiptTaskStep = {
  0: '等待进厂',
  1: '进厂检查中',
  2: '进厂检查结束',
  3: '车辆进厂',
  4: '确认收货物料和数量',
  5: '卸车前检查中',
  6: '卸车前检查结束',
  7: '送检',
  8: '破损记录',
  9: '卸货完成',
  10: '收货完成',
  11: '离厂检查中',
  13: '车辆离厂',
  15: '异常处理中',
};
export const SendTaskStep = {
  0: '等待进厂',
  1: '进厂检查中',
  2: '进厂检查结束',
  3: '车辆进厂',
  4: '确认收货物料和数量',
  5: '装车前检查中',
  6: '装车前检查结束',
  7: '装车',
  8: '破损记录',
  9: '装车完成',
  10: '装车后检查中',
  11: '装车后检查结束',
  12: '发运完成',
  13: '离厂检查中',
  15: '司机离厂',
  16: '异常处理中',
};

export const ReceiptTaskLogType = {
  CREATE: '创建',
  UPDATE: '更新',
  ENTRANCE_V_INSPECTING: '进厂检查中',
  SUBMIT_ENTRANCE_V_INSPECTING: '进厂检查',
  ENTRANCE_V_INSPECTED: '进厂检查结束',
  VEHICLE_ENTERING: '车辆进厂',
  GOODS_VERIFYING: '完成确认收货物料和数量',
  UNLOAD_V_INSPECTING: '卸车前检查中',
  SUBMIT_UNLOAD_V_INSPECTING: '卸车前检查',
  UNLOAD_V_INSPECTED: '卸车前检查结束',
  SAMPLE_Q_INSPECTING: '送检',
  UNLOAD: '卸车',
  DEFECT_RECORDING: '破损记录',
  UNLOAD_CONFIRMING: '卸货完成',
  RECEIVING_CONFIRMING: '收货完成',
  EXIT_V_INSPECTING: '离厂检查中',
  SUBMIT_EXIT_V_INSPECTING: '离厂检查',
  EXIT_V_INSPECTED: '离厂检查结束',
  FINISHED: '车辆离厂',
  REPORT_EXCEPTION: '报告异常',
  ADD_ASSIGNEE: '分配任务',
  TERMINATE: '结束任务',
  RESUME: '继续收货流程',
  ASSIGN_PARKING_SPACE: '选择车位',
  ADJUST_GOODS_AMOUNT: '调整物料数量',
  RECORD_EXTRA_GOOD: '增加其他收货物料',
  RECORD_DEFECT: '破损记录',
  RECORD_RECEIVE_MATERIAL: '记录入厂物料数',
};

export const SendTaskLogType = {
  CREATE: '创建',
  UPDATE: '更新',
  ENTRANCE_V_INSPECTING: '进厂检查中',
  SUBMIT_ENTRANCE_V_INSPECTING: '进厂检查',
  ENTRANCE_V_INSPECTED: '进厂检查结束',
  VEHICLE_ENTERING: '车辆进厂',
  GOODS_VERIFYING: '完成确认车位和货位',
  LOAD_V_INSPECTING: '装车前检查中',
  SUBMIT_LOAD_V_INSPECTING: '装车前检查',
  LOAD_V_INSPECTED: '装车前检查结束',
  LOAD: '装车',
  DEFECT_RECORDING: '破损记录',
  LOAD_CONFIRMING: '装车完成',
  AFTER_LOAD_V_INSPECTING: '装车后检查中',
  SUBMIT_AFTER_LOAD_V_INSPECTING: '装车后检查',
  AFTER_LOAD_V_INSPECTED: '装车后检查结束',
  EXIT_V_INSPECTING: '离厂检查中',
  SUBMIT_EXIT_V_INSPECTING: '离厂检查',
  EXIT_V_INSPECTED: '离厂检查结束',
  FINISHED: '发运完成',
  DRIVER_LEAVE: '司机离场',
  REPORT_EXCEPTION: '报告异常',
  ADD_ASSIGNEE: '分配任务',
  TERMINATE: '结束任务',
  RESUME: '继续收货流程',
  ASSIGN_PARKING_SPACE: '选择车位',
  ADJUST_GOODS_AMOUNT: '调整物料数量',
  RECORD_EXTRA_GOOD: '增加其他收货物料',
  RECORD_DEFECT: '破损记录',
  RECORD_RECEIVE_MATERIAL: '记录入厂物料数',
  ADJUST_GOODS_STORAGE: '编辑物料货位',
};

export const QC_TASK_STATUS = {
  0: '未开始',
  1: '执行中',
  2: '已结束',
  3: '已取消',
};

export const WEIGHING_TAG_TYPE = 1; // 称量标签
export const WEIGHING_LEFT_TAG_TYPE = 2; // 称量剩余量标签
export const RAW_MATERIAL_TAG_TYPE = 3; // 原材料标签
export const SEMI_FINISHED_MATERIAL_TAG_TYPE = 4; // 半成品标签
export const RETURN_MATERIAL_TAG_TYPE = 5; // 退料标签
export const REQUEST_CHECK_TAG_TYPE = 6; // 请检标签
export const SQMPLING_TAG_TYPE = 7; // 取样标签
export const NESTED_TAG_TYPE = 8;// 嵌套标签

export const tagTemplateTypeMap = {
  [WEIGHING_TAG_TYPE]: '称量标签',
  [WEIGHING_LEFT_TAG_TYPE]: '称量剩余量标签',
  [RAW_MATERIAL_TAG_TYPE]: '原材料标签',
  [SEMI_FINISHED_MATERIAL_TAG_TYPE]: '半成品标签',
  [RETURN_MATERIAL_TAG_TYPE]: '退料标签',
  [REQUEST_CHECK_TAG_TYPE]: '请检标签',
  [SQMPLING_TAG_TYPE]: '取样标签',
  [NESTED_TAG_TYPE]: '嵌套标签',
};

/** 原材料标签 */
export const rawMaterialLabel = [
  '$material_code$',
  '$material_name$',
  '$amount_unit$',
  '$inbound_batch$',
  '$quality_inspect_time$',
  '$production_date$',
  '$validity_period$',
  '$operator_name$',
  '$last_update_time$',
  '$qc_status$',
  '$description$',
  '$supplier_code$',
  '$mfg_batches$',
  '$storage_info$',
  '$inbound_note$',
  '$qr_code$',
  '$procure_order_code$',
];

/** 半成品标签 */
export const semiFinishedMaterialLabel = [
  '$material_code$',
  '$material_name$',
  '$amount_unit$',
  '$inbound_batch$',
  '$quality_inspect_time$',
  '$production_date$',
  '$validity_period$',
  '$operator_name$',
  '$last_update_time$',
  '$qc_status$',
  '$description$',
  '$supplier_code$',
  '$mfg_batches$',
  '$storage_info$',
  '$inbound_note$',
  '$qr_code$',
  '$procure_order_code$',
];

// 拥有审批计划工单和任务权限的角色
export const ROLES_HAS_AUDIT_AUTHORITY = [4, 5, 10];
export const addressData = {
  北京: ['北京市'],
  天津: ['天津市'],
  河北省: ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
  山西省: ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'],
  内蒙古自治区: ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟'],
  辽宁省: ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'],
  吉林省: ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边朝鲜族自治州'],
  黑龙江省: ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '大兴安岭地区'],
  上海: ['上海市'],
  江苏省: ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'],
  浙江省: ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
  安徽省: ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'],
  福建省: ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
  江西省: ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'],
  山东省: ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '莱芜市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'],
  河南省: ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市'],
  湖北省: ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市', '恩施土家族苗族自治州'],
  湖南省: ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '湘西土家族苗族自治州'],
  广东省: ['广州市', '韶关市', '深圳市', '珠海市', '汕头市', '佛山市', '江门市', '湛江市', '茂名市', '肇庆市',
  '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'],
  广西壮族自治区: ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'],
  海南省: ['海口市', '三亚市', '三沙市', '儋州市'],
  重庆市: ['重庆市'],
  四川省: ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市',
  '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市', '阿坝藏族羌族自治州', '甘孜藏族自治州', '凉山彝族自治州'],
  贵州省: ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'],
  云南省: ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '楚雄彝族自治州',
  '红河哈尼族彝族自治州', '文山壮族苗族自治州', '西双版纳傣族自治州', '大理白族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '迪庆藏族自治州'],
  西藏自治区: ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲地区', '阿里地区'],
  陕西省: ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'],
  甘肃省: ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '临夏回族自治州', '甘南藏族自治州'],
  青海省: ['西宁市', '海东市', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州', '海西蒙古族藏族自治州'],
  宁夏回族自治区: ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
  新疆维吾尔自治区: ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉回族自治州', '博尔塔拉蒙古自治州',
  '巴音郭楞蒙古自治州', '阿克苏地区', '克孜勒苏柯尔克孜自治州', '喀什地区', '和田地区', '伊犁哈萨克自治州', '塔城地区', '阿勒泰地区'],
  台湾省: ['台北市', '新北市', '桃园市', '台中市', '台南市', '高雄市'],
  香港: ['香港特别行政区'],
  澳门: ['澳门特别行政区'],
};

export const defaultLanguage = {
  procure_order: '采购清单',
  equipment_machining_material: '工装备件类',
};

export const WEIGHING_TASK_STATUS = {
  1: '未就绪',
  2: '未开始',
  3: '执行中',
  // 4: '暂停中',
  5: '已结束',
  6: '已取消',
};

// 导出时每次请求的数据数量
export const chunkSize = 500;

// 导出时最大单次导出数量
export const maxExportSize = 5000;

export const materialLotStatus = {
  1: '库存中',
  2: '转运中',
  3: '已投产',
  4: '已发货',
  5: '发料中',
  6: '已置空',
  7: '退料',
};
// 导入状态

export const IMPORT_STATUS = {
  IMPORT_FAILED: 0,
  IMPORT_SUCCESS: 1,
  IMPORT_PART_SUCCESS: 0,
  0: '导入失败',
  1: '导入成功',
  2: '部分导入成功',
};

// 计划工单状态
export const PLAN_TICKET_STATUS_CANCELED = 4; // 已取消

// 计划工单类型
export const PLAN_TICKET_NORMAL = 1; // 普通
export const PLAN_TICKET_BAITING = 2; // 下料
export const PLAN_TICKET_INJECTION_MOULDING = 3; // 注塑
export const planTicketMap = new Map([
  [PLAN_TICKET_NORMAL, '普通'],
  [PLAN_TICKET_BAITING, '下料'],
  [PLAN_TICKET_INJECTION_MOULDING, '注塑'],
]);

// 项目分类类型
export const PROJECT_CATEGORY_NORMAL = 1; // 普通
export const PROJECT_CATEGORY_BAITING = 2; // 下料
export const PROJECT_CATEGORY_INJECTION_MOULDING = 3; // 注塑

export const projectCategoryMap = new Map([
  [PROJECT_CATEGORY_NORMAL, '普通'],
  [PROJECT_CATEGORY_BAITING, '下料'],
  [PROJECT_CATEGORY_INJECTION_MOULDING, '注塑'],
]);

// 项目类型
export const PROJECT_TYPE_STORAGE = 1; // 面向库存
export const PROJECT_TYPE_PURCHASE_ORDER = 2; // 面向销售订单
export const projectTypeDisplay = {
  [PROJECT_TYPE_STORAGE]: '面向库存',
  [PROJECT_TYPE_PURCHASE_ORDER]: '面向销售订单',
};

// 启用，停用状态的常量
export const BASE_STATUS = {
  use: { name: '启用中', value: 1, color: primary },
  stop: { name: '停用中', value: 0, color: error },
};

// 根据value查询状态
export const findStatus = baseFind(BASE_STATUS);

// 任务类型
export const TASK_CATEGORY_PROD = 1;
export const TASK_CATEGORY_BAITING = 2;
export const TASK_CATEGORY_INJECT_MOLD = 3;

// 任务状态
export const taskStatusMap = new Map([
  [1, '未开始'], [2, '执行中'], [3, '暂停中'], [4, '已结束'], [5, '已取消'],
]);

/** 移动事务 */
export const MoveTransaction = {
  /** 超量领料 */
  overBalance: {
    code: 'BL003',
    name: '超量领料',
  },
  /** 退料 */
  sendBack: {
    code: 'BL004',
    name: '退料',
  },
};

export const NOTICE_CATEGORY = {
  inputFactoryQualified: {
    key: 309,
    label: '质检-入厂检合格',
  },
  prodCheckCompleted: {
    key: 310,
    label: '质检-首检/生产检完成',
  },
  // 自动发送的质检报告审核通知
  qcReportAuditAuto: {
    key: 311,
    label: '质检-报告审核',
  },
  // 手动发送的质检报告审核通知
  qcReportAuditManual: {
    key: 312,
    label: '质检-报告审核',
  },
};

// 根据key查询通知类型
export const findNoticeType = baseFind(NOTICE_CATEGORY, 'key');

export default 'dummy';
