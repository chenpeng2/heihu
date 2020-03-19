import { arrayIsEmpty } from 'src/utils/array';
import { changeTextLanguage, changeChineseToLocale } from 'src/utils/locale/utils';

// 给column增加config的初始值
export const initConfig = column => {
  return {
    ...column,
    checked: true,
  };
};

export const formatColumnConfigs = columnConfigs => {
  return Array.isArray(columnConfigs) ? columnConfigs.map(({ render, sortOrder, sorter, title, ...rest }) => rest) : [];
};

export const sortAndMergeColumnsByConfigs = (columns, _configs) => {
  const configs = _configs || [];
  if (!(columns && Array.isArray(columns) && columns.length)) return null;
  const sortedColumns = columns.sort((a, b) => {
    const { key: aKey, dataIndex: aDataIndex } = a;
    const aKeyPos = configs.findIndex(e => aKey && e.key === aKey);
    const aDataIndexPos = configs.findIndex(e => aDataIndex && e.dataIndex === aDataIndex);
    const aPos = aKeyPos !== -1 ? aKeyPos : aDataIndexPos;
    const { key: bKey, dataIndex: bDataIndex } = b;
    const bKeyPos = configs.findIndex(e => bKey && e.key === bKey);
    const bDataIndexPos = configs.findIndex(e => bDataIndex && e.dataIndex === bDataIndex);
    const bPos = bKeyPos !== -1 ? bKeyPos : bDataIndexPos;
    if (aPos === -1 || bPos === -1) {
      return 0;
    }
    return aPos - bPos;
  });
  return sortedColumns.map(column => {
    const { key, dataIndex } = column || {};
    const keyPos = configs.findIndex(e => key && e.key === key);
    const dataIndexPos = configs.findIndex(e => dataIndex && e.dataIndex === dataIndex);
    let newColumn = { ...column };
    if (key) {
      if (keyPos !== -1) {
        const keyObj = configs[keyPos];
        newColumn = {
          ...newColumn,
          ...keyObj,
          width: Math.max(newColumn.width, keyObj.width),
        };
      } else {
        newColumn = initConfig(newColumn);
      }
    } else if (dataIndex) {
      if (dataIndexPos !== -1) {
        const dataIndexObj = configs[dataIndexPos];
        newColumn = {
          ...newColumn,
          ...dataIndexObj,
          width: Math.max(newColumn.width, dataIndexObj.width),
        };
      } else {
        newColumn = initConfig(newColumn);
      }
    } else {
      newColumn = initConfig(newColumn);
    }
    return newColumn;
  });
};

// 将columns和configs合并
export const getColumnsWithConfigs = (columns, columnConfigs) => {
  const configs = columnConfigs || [];
  return sortAndMergeColumnsByConfigs(columns, configs);
};

export const generateTableConfigs = (columns, tableConfig) => {
  const { pageSize = 10, columnConfigs: _columnConfigs } = tableConfig || {};
  const columnConfigs = sortAndMergeColumnsByConfigs(columns, _columnConfigs);
  return {
    pageSize,
    columnConfigs,
  };
};

// 根据将columns的title语言改变
// 将根据中文去寻找对应语言的翻译
export const changeTitleLanguage = (columns, intl) => {
  if (arrayIsEmpty(columns)) return [];
  if (!intl) return columns;

  return columns.map(i => {
    const { title, ...rest } = i || {};
    return {
      title: changeChineseToLocale(title, intl),
      ...rest,
    };
  });
};

export default 'dummy';
