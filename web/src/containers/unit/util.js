import { primary, error } from 'src/styles/color';

export const UNIT_STATUS = {
  inUse: { name: '启用中', value: 1, color: primary },
  stop: { name: '停用中', value: 0, color: error },
};

export const findUnitStatus = (v) => {
  let res = null;
  Object.values(UNIT_STATUS).forEach(i => {
    if (i && i.value === v) res = i;
  });

  return res;
};

export default 'dummy';
