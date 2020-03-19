import LocalStorageUtils from 'src/utils/localStorage';
import { QUERY } from 'utils/url';

export const BASE_URL = '/stock/materialCollectReport';

// 汇总方式
export const COLLECT_WAY = {
  supply: { name: '按供应商汇总', value: 1 },
  supplyBatch: { name: '按供应商批次汇总', value: 2 },
  init: { name: '按入厂批次汇总', value: 3 },
};

const MATERIAL_REPORT_FILTER_KEY = 'materialReportFilterKey';

// 物料报表的filter本地保存
export const saveMaterialReportFilterValueInLocalStorage = value => {
  if (!value) return;
  LocalStorageUtils.set(MATERIAL_REPORT_FILTER_KEY, value);
};

// 获取物料报表的filter value
export const getMaterialReportFilterValueFromLocalStorage = () => {
  return LocalStorageUtils.get(MATERIAL_REPORT_FILTER_KEY);
};

/**
 * 物料汇总报表 navigation
 *
 * @param {Object} filter 页面搜索过滤参数
 */
export const toMaterialCollectReport = ({ filter }) => {
  return `${BASE_URL}?${QUERY}=${encodeURIComponent(JSON.stringify({ filter }))}`;
};

export default 'dummy';
