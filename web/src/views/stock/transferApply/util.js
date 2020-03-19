import _ from 'lodash';
import { baseValidate } from 'src/components/form/index';
import LocalStorageUtils from 'src/utils/localStorage';
import { grey, middleGrey, purple, blueViolet, warning, primary, greyGreen, error } from 'src/styles/color/index';
import { isOrganizationUseQrCode, isTransferApplyWithMoveTransactionConfig } from 'src/utils/organizationConfig';
import { baseFind } from 'src/utils/object';
import moment from 'src/utils/time';
import { arrayIsEmpty } from 'src/utils/array';
import { queryTransferApplyList } from 'src/services/cooperate/materialRequest';

export const APPLY_STATUS = {
  created: { name: '已创建', actionName: '创建', value: 0, color: middleGrey },
  mergeCreated: { name: '合并创建', actionName: '合并创建', value: 9, color: middleGrey },
  mergeCancel: { name: '合并取消', actionName: '合并取消', value: 10, color: grey },
  issue: { name: '已下发', actionName: '下发', value: 1, color: purple },
  done: { name: '执行中', value: 2, color: blueViolet },
  issueFinish: { name: '发出完成', value: 3, color: greyGreen },
  acceptFinish: { name: '接收完成', value: 4, color: primary },
  errorFinish: { name: '异常结束', value: 6, color: error },
  abort: { name: '已取消', actionName: '取消', value: 5, color: grey },
  stop: { name: '暂停中', actionName: '暂停', value: 7, color: warning },
  continue: { name: '继续', value: 8, isStatus: false }, // 用来更新状态，但是并不是状态
};

export const findApplyStatus = status => {
  const values = Object.values(APPLY_STATUS);

  let res = null;
  values.forEach(i => {
    if (i && i.value === status) res = i;
  });

  return res;
};

export const EXECUTE_STATUS = {
  unStart: { name: '未开始', color: middleGrey, value: 0 },
  doing: { name: '执行中', color: blueViolet, value: 1 },
  sendComplete: { name: '发出完成', color: primary, value: 2 },
  receiveComplete: { name: '接收完成', color: primary, value: 3 },
};

export const findExecuteStatus = status => {
  const values = Object.values(EXECUTE_STATUS);

  let res = null;
  values.forEach(i => {
    if (i && i.value === status) res = i;
  });

  return res;
};

export const codeFormatValidate = baseValidate(/^[A-Za-z0-9]+$/, '转移记录编码仅支持英文和数字');

const KEEP_CREATE_TRANSFER_APPLY_KEY = 'keepCreateTransferApply';

export const setKeepCreateTransferApplyInLocalStorage = value => {
  LocalStorageUtils.set(KEEP_CREATE_TRANSFER_APPLY_KEY, value);
};

export const getKeepCreateTransferApplyFromLocalStorage = () => {
  return LocalStorageUtils.get(KEEP_CREATE_TRANSFER_APPLY_KEY);
};

export const getTransferApplyEditPageUrl = id => {
  if (!id) return null;
  return `/stock/transferApply/${id}/edit`;
};

export const goToCreateTransferApplyPage = router => {
  if (!router) return;
  router.history.push('/stock/transferApply/create');
};

export const getTransferApplyListPageUrl = () => '/stock/transferApply';

const TRANSFER_APPLY_FILTER_KEY = 'transferApplyFilterKey';

// 转移申请的filter本地保存
export const saveTransferApplyFilterValueInLocalStorage = value => {
  if (!value) return;
  LocalStorageUtils.set(TRANSFER_APPLY_FILTER_KEY, value);
};

// 获取转移申请的filter value
export const getTransferApplyFilterValueFromLocalStorage = () => {
  return LocalStorageUtils.get(TRANSFER_APPLY_FILTER_KEY);
};

const TRANSFER_APPLY_MOVE_TRANSACTION_KEY = 'transferApplyMovieTransactionKey';

// 将转移申请的移动事务保存在本地
export const saveTransferApplyMoveTransactionValueInLocalStorage = value => {
  if (!value) return;
  LocalStorageUtils.set(TRANSFER_APPLY_MOVE_TRANSACTION_KEY, value);
};

// 将转移申请的移动事务保存在本地
export const getTransferApplyMoveTransactionValueInLocalStorage = value => {
  if (!value) return;
  LocalStorageUtils.get(TRANSFER_APPLY_MOVE_TRANSACTION_KEY);
};

// 转移申请是否关联移动事务
export const isTransferApplyConnectWithMoveTransaction = () => {
  return isOrganizationUseQrCode() && isTransferApplyWithMoveTransactionConfig();
};

// 转移申请来源类型
export const TRANSFER_APPLY_SOURCE_TYPE = {
  none: { value: 0, name: '无来源' },
  prodTask: { value: 1, name: '生产任务' },
  schedule: { value: 2, name: '排程' },
};

export const findTransferApplySourceType = baseFind(TRANSFER_APPLY_SOURCE_TYPE);

// 获取转移申请合并页面url
export const getTransferApplyMergePageUrl = () => '/stock/transferApply/merge';

// 将detail data格式化为form需要的data
export const formatDetailDataToBaseFormData = detailData => {
  if (!detailData) return null;
  const { header, items } = detailData;
  const {
    sourceId,
    sourceType,
    transactionCode,
    transactionName,
    remark,
    code,
    requireTime,
    sourceWarehouseCode,
    sourceWarehouseName,
    targetStorageId,
    targetStorageCode,
  } = header;

  const _requireDate = requireTime ? moment(requireTime) : undefined;
  const _timeDetail = requireTime ? moment(requireTime) : undefined;

  return {
    code,
    sourceWarehouse: { key: sourceWarehouseCode, label: sourceWarehouseName },
    targetStorage: `${targetStorageId},${targetStorageCode},3`,
    remark,
    transferBusiness: {
      key: transactionCode,
      label: transactionCode && transactionName ? `${targetStorageCode}/${transactionName}` : undefined,
    },
    requireTime: _requireDate,
    timeDetail: _timeDetail,
    materialList: Array.isArray(items)
      ? items.map(i => {
          const { id, lineId, unitId, materialUnit, materialCode, materialName, planingAmount, remark } = i || {};
          return {
            id,
            lineId,
            unit: { key: unitId, label: materialUnit },
            material: { key: materialCode, label: `${materialCode}/${materialName}` },
            amount: planingAmount,
            remark,
          };
        })
      : [],
    sourceId,
    sourceType,
  };
};

// 合并转移申请的数据处理
export const formatDataForMerge = detailData => {
  if (!detailData) return null;
  const { header, items } = detailData;
  const {
    transactionCode,
    transactionName,
    remark,
    requireTimes,
    sourceWarehouseCode,
    sourceWarehouseName,
    targetStorageId,
    targetStorageCode,
  } = header;

  return {
    sourceWarehouse: { key: sourceWarehouseCode, label: sourceWarehouseName },
    transaction: transactionCode ? { key: transactionCode, label: `${transactionCode}/${transactionName}` } : undefined,
    targetStorage: `${targetStorageId},${targetStorageCode},3`,
    remark,
    requireTimes,
    materialList: Array.isArray(items)
      ? items.map(i => {
          const {
            headerCodes,
            id,
            lineId,
            unitId,
            materialUnit,
            materialCode,
            materialName,
            planingAmount,
            remark,
            mergeDetail,
          } = i || {};
          return {
            id,
            lineId,
            unit: { key: unitId, label: materialUnit },
            material: { key: materialCode, label: `${materialCode}/${materialName}` },
            amount: planingAmount,
            remark,
            mergeDetail,
            headerCodes,
          };
        })
      : [],
  };
};

// 根据ids来获取转移申请的详情数据
export const getMergedTransferApplyListByIds = (mergedTransferApplyIds, cb) => {
  queryTransferApplyList({
    ids: mergedTransferApplyIds,
    size: arrayIsEmpty(mergedTransferApplyIds) ? 10 : mergedTransferApplyIds.length,
  }).then(res => {
    const data = _.get(res, 'data.data');
    cb(data);
  });
};

export default 'dummy';
