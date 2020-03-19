import { baseFind } from 'src/utils/object';
import { getCustomLanguage } from 'src/utils/customLanguage';

const customLanguage = getCustomLanguage();

export const STRATEGY_APPLiCATION_SCOPE = {
  ALL: {
    label: '全部',
    key: 0,
  },
  DEVICE: {
    label: '设备',
    key: 1,
  },
  MACHINEMATERIAL: {
    label: customLanguage.equipment_machining_material,
    key: 2,
  },
};

export const findStrategyApplicationScope = baseFind(STRATEGY_APPLiCATION_SCOPE, 'key');
