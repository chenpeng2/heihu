import { baseFind } from 'src/utils/object';

export const useStorageCapacity = {
  use: { name: '启用', value: 1 },
  stop: { name: '不启用', value: 0 },
};

export const STORAGE_CAPACITY = {
  max: { name: '最大库存检查', value: 1 },
  safe: { name: '安全库存检查', value: 2 },
  min: { name: '最小库存检查', value: 3 },
};

export const findStorageCapacity = baseFind(STORAGE_CAPACITY);

// 根据type获取安全库存或者最大，最小库存的title
export const getTitleByType = type => {
  const _type = findStorageCapacity(type);
  return _type ? _type.name.slice(0, 4) : null;
};


export default 'dummy';
