import LocalStorageUtils from 'src/utils/localStorage';

export const goToSplitRecordDetailPage = (router, id) => {
  if (!router || !id) return;
  router.history.push(`/stock/splitRecord/${id}/detail`);
};

const SPLIT_RECORD_FILTER_KEY = 'splitRecordFilterKey';

// 转移申请的filter本地保存
export const saveSplitRecordFilterValueInLocalStorage = (value) => {
  if (!value) return;
   LocalStorageUtils.set(SPLIT_RECORD_FILTER_KEY, value);
};

// 获取转移申请的filter value
export const getSplitRecordFilterValueFromLocalStorage = () => {
  return LocalStorageUtils.get(SPLIT_RECORD_FILTER_KEY);
};


export default 'dummy';
