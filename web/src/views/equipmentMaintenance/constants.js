import { blacklakeGreen, error, processing, warning, purple, fontSub } from 'src/styles/color';

export const taskStatus = [
  {
    label: '审批中',
    key: 1,
    color: purple,
  },
  {
    label: '未开始',
    key: 2,
    color: `${fontSub}4D`,
  },
  {
    label: '执行中',
    key: 3,
    color: processing,
  },
  {
    label: '已暂停',
    key: 4,
    color: warning,
  },
  {
    label: '已结束',
    key: 5,
    color: blacklakeGreen,
  },
  {
    label: '已取消',
    key: 6,
    color: fontSub,
  },
  {
    label: '审批驳回',
    key: 7,
    color: error,
  },
  {
    label: '验收中',
    key: 8,
    color: '#02B980',
  },
  {
    label: '验收驳回',
    key: 9,
    color: '#FF3B30',
  },
];

export const EQUIPMENT_PROD = 'equipmentProd';
export const EQUIPMENT_MODULE = 'equipmentModule';

export const EQUIPMENT_TYPE_CATEGORY = {
  equipmentProd: '生产设备',
  equipmentModule: '设备组件',
};

export const SPAREPARTS = 1;
export const TOOLING = 2;

export const MACHINING_MATERIAL_TYPE = {
  [SPAREPARTS]: '备件',
  [TOOLING]: '工装',
};

export const REPAIR = 1; // 维修
export const MAINTAIN = 2; // 保养
export const CHECK = 3; // 点检

export const STRATEGY_CATEGORY = {
  [REPAIR]: '维修',
  [MAINTAIN]: '保养',
  [CHECK]: '点检',
};

export const PERIOD_FIXED = 1; // 固定周期
export const PERIOD_FLOAT = 2; // 浮动周期
export const METRIC_ACC = 3; // 累计用度
export const METRIC_FIXED = 4; // 固定用度
export const MANUAL = 5; // 手动创建

export const STRATEGY_TRIGGER_TYPE = {
  [PERIOD_FIXED]: '固定周期',
  [PERIOD_FLOAT]: '浮动周期',
  [METRIC_ACC]: '累计用度',
  [METRIC_FIXED]: '固定用度',
  [MANUAL]: '手动创建',
};

export const CLEANED = 1;
export const WAITFORCLEAN = 2;

export const EQUIPMENT_CLEAN_STATUS = {
  [CLEANED]: '已清洁',
  [WAITFORCLEAN]: '待清洁',
};

export const MODULE = 'module';

export const TARGET_TYPE = {
  [EQUIPMENT_PROD]: '设备',
  [EQUIPMENT_MODULE]: '设备组件',
  [MODULE]: '模具',
};
