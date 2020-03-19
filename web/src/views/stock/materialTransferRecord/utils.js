import LocalStorage from 'src/utils/localStorage';

const OUT_STORAGE_FILTER_KEY = 'outStorageFilterValue';
const IN_STORAGE_FILTER_KEY = 'inStorageFilterValue';

// 将出库记录的filter存储在本地
export const saveOutStorageFilterInLocalStorage = filterValue => {
  LocalStorage.set(OUT_STORAGE_FILTER_KEY, filterValue, { orgLimit: true });
};

// 从localStorage获取出库记录的filter
export const getOutStorageFilterFromLocalStorage = () => {
  return LocalStorage.get(OUT_STORAGE_FILTER_KEY);
};

// 将入库记录的filter存储在本地
export const saveInStorageFilterInLocalStorage = filterValue => {
  LocalStorage.set(IN_STORAGE_FILTER_KEY, filterValue, { orgLimit: true });
};

// 从localStorage获取出库记录的filter
export const getInStorageFilterFromLocalStorage = () => {
  return LocalStorage.get(IN_STORAGE_FILTER_KEY);
};

export default 'dummy';
