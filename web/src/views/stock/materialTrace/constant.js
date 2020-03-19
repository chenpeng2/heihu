// 库存中
const IN_FACTORY = 1;
// 转运中
const TRANSFERRING = 2;
// 已出厂
const EXIT_FACTORY = 4;
// 发料中
const INGREDIENTS = 5;
// 已投产
const IN_PRODUCTION = 3;
// 已重置
const RESETED = 6;
// 退料中
const EXITING_MATERIAL = 7;

export const MaterialStatus = {
  // 厂内物料
  [IN_FACTORY]: '厂内物料',
  [TRANSFERRING]: '厂内物料',
  [INGREDIENTS]: '厂内物料',
  [EXITING_MATERIAL]: '厂内物料',
  // 已出厂
  [EXIT_FACTORY]: '已出厂',
  // 已投产
  [IN_PRODUCTION]: '已投产',
  // 已置空
  [RESETED]: '已置空',
};
