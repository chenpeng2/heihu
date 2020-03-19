import { error, primary, warning } from 'src/styles/color';
import { baseFind } from 'src/utils/object';

export const TOOLING_STATUS = {
  all: {
    label: '全部',
    key: '',
  },
  1: {
    color: warning,
    label: '已闲置',
    key: '1',
  },
  2: {
    color: primary,
    label: '已启用',
    key: '2',
  },
  3: {
    color: error,
    label: '已报废',
    key: '3',
  },
};

export const findStatusByLabel = baseFind(TOOLING_STATUS, 'label');

export const TOOLING_TYPE = {
  1: '一般工装',
  2: '模具',
};

export const TOOLING_PLAN_INFO = {
  TURN_ON_TIME: {
    name: '上膜时间',
    value: '1',
  },
  TURN_OFF_TIME: {
    name: '下膜时间',
    value: '2',
  },
  TUNE_TIME: {
    name: '调机时间',
    value: '3',
  },
};
