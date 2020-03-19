import { primary, error } from 'src/styles/color';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

export const MATERIAL_TYPE_STATUS = {
  inUse: { name: changeChineseToLocaleWithoutIntl('启用'), value: 1, color: primary },
  inStop: { name: changeChineseToLocaleWithoutIntl('停用'), value: 0, color: error },
};

// 根据materialType的val来找相关的信息
export const findMaterialType = data => {
  const values = Object.values(MATERIAL_TYPE_STATUS);

  let res = null;

  values.forEach(i => {
    if (i && i.value === data) res = i;
  });

  return res;
};

// 格式化form中的value
export const formatFormValue = value => {
  if (!value) return null;
  const { processRoute, ...rest } = value;
  return {
    processRoutingCode: processRoute ? processRoute.key : null,
    ...rest,
  };
};

export default 'dummy';
