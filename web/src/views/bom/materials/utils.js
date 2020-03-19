import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { arrayIsEmpty } from 'src/utils/array';

// 0：升序排列，1：降序排列
export const ASCEND = 0;
export const DESCEND = 1;

export const qualityOptions = [
  {
    value: 1,
    label: changeChineseToLocaleWithoutIntl('合格'),
    disabled: true,
  },
  {
    value: 2,
    label: changeChineseToLocaleWithoutIntl('让步合格'),
  },
  {
    value: 3,
    label: changeChineseToLocaleWithoutIntl('待检'),
  },
  {
    value: 4,
    label: changeChineseToLocaleWithoutIntl('不合格'),
  },
  {
    value: 5,
    label: changeChineseToLocaleWithoutIntl('暂控'),
  },
];

// 给后端的当前排序的字段
export const COLUMN_KEYS = {
  createdAt: { value: 1 },
  code: { value: 0 },
};

export const NEEDREQUESTMATERIAL_VALUE_DISPLAY_MAP = {
  1: '按计划排程请料',
  0: '自行管控',
};

// 格式化table的sort columns为后端需要的sort params
export const getSortParams = sorter => {
  if (!sorter) return;

  const sortParams = {};
  const { columnKey, order } = sorter || {};
  // sortColumnKey是因为antd的table同一时刻，只可以有一个排序
  if (columnKey === 'createdAt' && order === 'descend') {
    sortParams.isCreatedDesc = DESCEND;
    sortParams.isCodeDesc = undefined;
    sortParams.columnKey = COLUMN_KEYS.createdAt.value;
  }
  if (columnKey === 'createdAt' && order === 'ascend') {
    sortParams.isCreatedDesc = ASCEND;
    sortParams.isCodeDesc = undefined;
    sortParams.columnKey = COLUMN_KEYS.createdAt.value;
  }
  if (columnKey === 'code' && order === 'descend') {
    sortParams.isCodeDesc = DESCEND;
    sortParams.isCreatedDesc = undefined;
    sortParams.columnKey = COLUMN_KEYS.code.value;
  }
  if (columnKey === 'code' && order === 'ascend') {
    sortParams.isCodeDesc = ASCEND;
    sortParams.isCreatedDesc = undefined;
    sortParams.columnKey = COLUMN_KEYS.code.value;
  }
  return sortParams;
};

// 根据转换单位计算对应单位的对应数量
export const convertAmountByUnitConversions = (amount, amountUnId, targetUnitId, unitConversions) => {
  if (!arrayIsEmpty(unitConversions)) {
    const amountUnit = unitConversions.find(i => i && i.slaveUnitId === amountUnId);
    const targetUnit = unitConversions.find(i => i && i.slaveUnitId === targetUnitId);
    if (!amountUnId) return amount;
    if (!targetUnit) return amount;

    return (
      (targetUnit.slaveUnitCount * amount * amountUnit.masterUnitCount) /
      (targetUnit.masterUnitCount * amountUnit.slaveUnitCount)
    );
  }
  return amount;
};

export default 'dummy';
