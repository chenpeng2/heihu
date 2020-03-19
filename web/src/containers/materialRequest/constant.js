import { blue, secondaryGrey, primary, middleGrey } from 'src/styles/color';

export const useLogic = {
  qualified: { value: 1, name: '合格' },
  concessionQualified: { value: 2, name: '让步合格' },
  waittingForCheck: { value: 3, name: '待检' },
  faulty: { value: 4, name: '不合格' },
};

export const STATUS = {
  unAssign: { value: 0, name: '未下发', color: secondaryGrey },
  cancel: { value: 1, name: '已取消', color: middleGrey },
  undone: { value: 2, name: '未处理', color: secondaryGrey },
  done: { value: 3, name: '处理中', color: blue },
  finish: { value: 4, name: '已完成', color: primary },
};

export default 'dummy';
