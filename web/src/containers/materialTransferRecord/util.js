export const OUT_STORAGE_TYPES = {
  outStorage: { name: '出库', value: 'out' },
  outMaterial: { name: '发料', value: 'issue' },
};

export const IN_STORAGE_TYPES = {
  inStorage: { name: '入库', value: 'in' },
  outMaterial: { name: '领料', value: 'picking' },
};

export const findOutStorageTypes = v => {
  let res = null;
  Object.values(OUT_STORAGE_TYPES).forEach(i => {
    if (i && i.value === v) res = i;
  });

  return res;
};

export const findInStorageTypes = v => {
  let res = null;
  Object.values(IN_STORAGE_TYPES).forEach(i => {
    if (i && i.value === v) res = i;
  });

  return res;
};

export default 'dummy';
