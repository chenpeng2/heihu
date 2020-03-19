import _ from 'lodash';
import { error, primary } from 'src/styles/color';

export const QCDEFECT_REASON_STATUS = {
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

export const qcDefectReasonHeaderDesc = ['不能为空。最长不超过50个字符。且不可重复', '可以为空。最长不超过100个字符'];

export const qcDefectReasonHeader = ['名称', '备注'];
