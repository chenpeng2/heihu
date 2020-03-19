import _ from 'lodash';
import { error, primary } from 'src/styles/color';
import { baseFind } from 'src/utils/object';

export const MOVE_TRANSACTIONS_STATUS = {
  all: {
    label: '全部',
    key: '',
  },
  0: {
    color: error,
    label: '停用',
    key: '0',
  },
  1: {
    color: primary,
    label: '启用',
    key: '1',
  },
};

export const MODULE_NAME = {
  webMove: {
    name: 'WEB-转移申请',
    value: 'WEB-转移申请',
  },
  appMaterialTransfer: {
    name: 'APP-物料转移',
    value: 'APP-物料转移',
  },
};

export const findModuleNameByValue = baseFind(MODULE_NAME);
