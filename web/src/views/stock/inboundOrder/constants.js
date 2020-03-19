import { error, primary, processing, fontSub } from 'src/styles/color';

export const INBOUND_ORDER_STATUS = {
  all: {
    label: '全部',
    key: '',
  },
  1: {
    color: processing,
    label: '已创建',
    key: '1',
  },
  2: {
    color: primary,
    label: '已下发',
    key: '2',
  },
  3: {
    color: fontSub,
    label: '已取消',
    key: '3',
  },
  4: {
    color: error,
    label: '已结束',
    key: '4',
  },
  5: {
    color: fontSub,
    label: '已完成',
    key: '5',
  },
};

export const STORAGE = {
  1: 'warehouse', // 仓库
  2: 'firstStorage', // 一级仓位
  3: 'storage', // 二级仓位
  warehouse: 1,
  firstStorage: 2,
  storage: 3,
};

export default 'dummy';
