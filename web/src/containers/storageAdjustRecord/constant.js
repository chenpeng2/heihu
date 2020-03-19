import { error, primary, border } from 'src/styles/color';

export const STATUS = {
  enSure: { name: '已过账' },
  unSure: { name: '未过账' },
};

export const qcStatus = {
  qualified: { name: '合格', value: 1, color: primary },
  partQualified: { name: '让步合格', value: 2, color: primary },
  waitCheck: { name: '待检', value: 3, color: border },
  unQualified: { name: '不合格', value: 4, color: error },
};

export default 'dummy';
