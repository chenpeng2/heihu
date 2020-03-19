export const FIFO_VALUE_DISPLAY_MAP = {
  0: '批量生产手动更新',
  1: '单件顺序生产自动更新',
  2: '批量生产自动更新',
};

export const OUTPUT_FROZEN_CATEGORY = {
  frozen: { value: 1 },
  notFrozen: { value: 0 },
};

export const getCreateProcessPath = () => '/bom/newProcess/create';
export const getProcessImportListPath = () => '/bom/newProcess/logs/import';

export default 'dummy';
