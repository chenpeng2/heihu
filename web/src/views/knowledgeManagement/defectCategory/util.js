import { baseFind } from 'src/utils/object';
import { error, primary } from 'src/styles/color';

// 次品分类的状态
export const DEFECT_CATEGORY_STATUS = {
  inUse: { name: '启用中', value: 1, color: primary },
  inStop: { name: '停用中', value: 0, color: error },
};

// 根据value查找次品分类
export const findDefectCategory = baseFind(DEFECT_CATEGORY_STATUS);

export default 'dummy';
