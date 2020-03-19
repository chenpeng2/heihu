import _ from 'lodash';

import { getWithdrawRecord } from 'src/services/stock/withdrawRecord';
import log from 'src/utils/log';
import { arrayIsEmpty } from 'src/utils/array';
import { baseFind } from 'src/utils/object';
import { replaceSign } from 'src/constants';
import { findQualityStatus } from 'src/views/qualityManagement/constants';
import moment from 'src/utils/time';

export const WITHDRAW_ORIGINAL = {
  normal: { name: '普通退料', value: 0 },
  byReverseOrder: { name: '入库单', value: 1 },
};

export const findWithdrawOriginal = baseFind(WITHDRAW_ORIGINAL);

// 获取退料对象
export const getWithdrawOriginal = recordData => {
  //  退料对象枚举{入库单、采购清单、普通退料}
  const { type } = recordData || {};
  const { name } = findWithdrawOriginal(type) || {};
  return name || replaceSign;
};

// 获取创建时间
export const getCreateTime = time => (time ? moment(time).format('YYYY/MM/DD HH:mm') : replaceSign);

// 导出数据格式化
export const formatExportData = value => {
  const headers = [
    '二维码',
    '物料编号',
    '物料名称',
    '数量',
    '单位',
    '退料仓位编码',
    '退料仓位名称',
    '供应商编码',
    '供应商名称',
    '入厂批次',
    '质量状态',
    '退料对象',
    '操作人',
    '操作时间',
    '备注',
  ];

  const _values = [];
  if (!arrayIsEmpty(value)) {
    value
      .filter(i => i)
      .forEach(i => {
        const {
          qcStatus,
          inboundBatch,
          supplierCode,
          supplierName,
          qrCode,
          materialCode,
          materialName,
          amount,
          unit,
          storageCode,
          storageName,
          operatorName,
          createdAt,
          remark,
        } = i || {};

        const { name: qcStatusName } = findQualityStatus(qcStatus) || {};
        const withdrawOriginal = getWithdrawOriginal(i);

        _values.push([
          qrCode || replaceSign,
          materialCode || replaceSign,
          materialName || replaceSign,
          typeof amount === 'number' ? String(amount) : replaceSign,
          unit || replaceSign,
          storageCode || replaceSign,
          storageName || replaceSign,
          supplierCode || replaceSign,
          supplierName || replaceSign,
          inboundBatch || replaceSign,
          qcStatusName || replaceSign,
          withdrawOriginal || replaceSign,
          operatorName || replaceSign,
          createdAt ? getCreateTime(createdAt) : replaceSign,
          remark || replaceSign,
        ]);
      });
  }

  return [headers, ..._values];
};

// 拉取退料记录数据
export const fetchWithdrawRecord = async params => {
  try {
    const res = await getWithdrawRecord(params);
    return _.get(res, 'data');
  } catch (e) {
    log.error(e);
  }
};

export default 'dummy';
