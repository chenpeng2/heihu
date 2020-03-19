export const expandStorage = (record, isPackup, clear) => ({
  type: 'expandStorage',
  record,
  isPackup,
  clear,
});

export const createStorage = record => ({
  type: 'create',
  record,
});

export const editStorage = record => ({
  type: 'edit',
  record,
});

export default 'dummy';
