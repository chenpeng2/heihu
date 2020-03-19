import LocalStorage from 'utils/localStorage';

const EBOM_VERSION_LOCALSTORAGE_KEY = 'EBOM_VERSION';

export const setEbomVersionInLocalStorage = version => {
  if (version) LocalStorage.set(EBOM_VERSION_LOCALSTORAGE_KEY, version);
};

export const getEbomVersionInLocalStorage = () => {
  return LocalStorage.get(EBOM_VERSION_LOCALSTORAGE_KEY) || undefined;
};

// 0：升序排列，1：降序排列
export const ASCEND = 0;
export const DESCEND = 1;

// 给后端的当前排序的字段
export const COLUMN_KEYS = {
  createdAt: { value: 1 },
  code: { value: 0 },
};

export const getSortParams = sorter => {
  if (!sorter) return;

  const sortParams = {};
  const { columnKey, order } = sorter || {};
  // sortColumnKey是因为antd的table同一时刻，只可以有一个排序
  if (columnKey === 'createdAt' && order === 'descend') {
    sortParams.isCreatedDesc = DESCEND;
    sortParams.isProductCodeDesc = undefined;
    sortParams.columnKey = COLUMN_KEYS.createdAt.value;
  }
  if (columnKey === 'createdAt' && order === 'ascend') {
    sortParams.isCreatedDesc = ASCEND;
    sortParams.isProductCodeDesc = undefined;
    sortParams.columnKey = COLUMN_KEYS.createdAt.value;
  }
  if (columnKey === 'productMaterialCode' && order === 'descend') {
    sortParams.isProductCodeDesc = DESCEND;
    sortParams.isCreatedDesc = undefined;
    sortParams.columnKey = COLUMN_KEYS.code.value;
  }
  if (columnKey === 'productMaterialCode' && order === 'ascend') {
    sortParams.isProductCodeDesc = ASCEND;
    sortParams.isCreatedDesc = undefined;
    sortParams.columnKey = COLUMN_KEYS.code.value;
  }
  return sortParams;
};

export default 'dummy';
