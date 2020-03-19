import _ from 'lodash';

import { isOrganizationUseQrCode } from 'src/utils/organizationConfig';
import { Big } from 'src/utils/number';
import moment from 'src/utils/time';
import { findQualityStatus } from 'src/views/qualityManagement/constants';
import { arrayIsEmpty } from 'src/utils/array';
import { replaceSign } from 'src/constants';
import { baseFind } from 'src/utils/object';


// 调整的明细的名字
export const ADJUST_ITEM_NAME = {
  amount: { value: 'amount', name: '数量' },
  productionDate: { value: 'productionDate', name: '生产日期' },
  validityPeriod: { value: 'validityPeriod', name: '有效期' },
  originPlace: { value: 'originPlace', name: '产地' },
  supplierCode: { value: 'supplierCode', name: '供应商' },
  mfgBatches: { value: 'mfgBatches', name: '供应商批次' },
  project: { value: 'project', name: '项目' },
  purchaseOrder: { value: 'purchaseOrder', name: '订单' },
};

export const findAdjustName = baseFind(ADJUST_ITEM_NAME);

// 获取导出文件的header
export const getHeaders = useSignStatus => {
  const useQrCode = isOrganizationUseQrCode();
  const baseHeaders = [
    '记录编号',
    '事务名称',
    '事务编码',
    '功能模块',
    '是否过账',
    useQrCode && '二维码',
    useQrCode && '物料编码',
    '物料名称',
    '父级二维码',
    '质量状态',
    '备注',
    '区域名称',
    '区域编码',
    '操作时间',
    useSignStatus && '电子签名人',
    '操作人',
    '调整前数量',
    '调整后数量',
    '调整数量',
    '调整前生产日期',
    '调整后生产日期',
    '调整前有效期',
    '调整后有效期',
    '调整前产地',
    '调整后产地',
    '调整前供应商',
    '调整后供应商',
    useQrCode && '调整前供应商批次',
    useQrCode && '调整后供应商批次',
    '调整前占用项目',
    '调整后占用项目',
    '调整前占用订单',
    '调整后占用订单',
  ];
  return _.compact(baseHeaders);
};

// 格式化导出的数据
// 第二个参数表示是否使用电子签名。这个函数不是公用的暂时不改为{}格式
export const formatExportData = (data, useSignStatus) => {
  if (arrayIsEmpty(data)) return [];

  return data.map(x => {
    const {
      recordCode,
      transactionName,
      transactionCode,
      module,
      materialCode,
      materialName,
      storageCode,
      storageName,
      createdAt,
      operatorName,
      unit,
      qcStatus,
      mfgBatchesBefore,
      mfgBatchesAfter,
      qrcode,
      containerCode,
      remark,
      digitalSignatureUserName,
      details,
    } = x;

    // 调整明细处理
    const adjustContainers = {};
    if (!arrayIsEmpty(details)) {
      details.forEach(i => {
        const { name, old_value, new_value } = i || {};
        if (name === ADJUST_ITEM_NAME.amount.value) {
          adjustContainers['调整前数量'] = old_value ? parseFloat(old_value) : null;
          adjustContainers['调整后数量'] = new_value ? parseFloat(new_value) : null;
          adjustContainers['调整数量'] = Big(Number(old_value)).minus(Number(new_value));
        }
        if (name === ADJUST_ITEM_NAME.productionDate.value) {
          adjustContainers['调整前生产日期'] = old_value ? moment(old_value).format('YYYY/MM/DD') : null;
          adjustContainers['调整后生产日期'] = new_value ? moment(new_value).format('YYYY/MM/DD') : null;
        }
        if (name === ADJUST_ITEM_NAME.validityPeriod.value) {
          adjustContainers['调整前有效期'] = old_value ? moment(old_value).format('YYYY/MM/DD') : null;
          adjustContainers['调整后有效期'] = new_value ? moment(new_value).format('YYYY/MM/DD') : null;
        }
        if (name === ADJUST_ITEM_NAME.originPlace.value) {
          adjustContainers['调整前产地'] = old_value;
          adjustContainers['调整后产地'] = new_value;
        }
        if (name === ADJUST_ITEM_NAME.supplierCode.value) {
          adjustContainers['调整前供应商'] = old_value;
          adjustContainers['调整后供应商'] = new_value;
        }
        if (name === ADJUST_ITEM_NAME.mfgBatches.value) {
          adjustContainers['调整前供应商批次'] = !arrayIsEmpty(old_value)
            ? old_value.map(i => i.mfgBatchNo).join(',')
            : null;
          adjustContainers['调整后供应商批次'] = !arrayIsEmpty(new_value)
            ? new_value.map(i => i.mfgBatchNo).join(',')
            : null;
        }
        if (name === ADJUST_ITEM_NAME.project.value) {
          adjustContainers['调整前占用项目'] = old_value;
          adjustContainers['调整后占用项目'] = new_value;
        }
        if (name === ADJUST_ITEM_NAME.purchaseOrder.value) {
          adjustContainers['调整前占用订单'] = old_value;
          adjustContainers['调整后占用订单'] = new_value;
        }
      });
    }

    // 质量状态
    const _qcStatus = findQualityStatus(qcStatus);

    const baseData = Object.assign(
      {},
      {
        记录编号: recordCode || '',
        事务名称: transactionName || '',
        事务编码: transactionCode || '',
        功能模块: module || '',
        是否过账: '已过账',
        二维码: qrcode || '',
        物料名称: materialName || '',
        物料编码: materialCode || '',
        区域名称: storageName || '',
        区域编码: storageCode || '',
        操作时间: createdAt ? moment(createdAt).format('YYYY/MM/DD HH:mm') : '',
        操作人: operatorName || '',
        电子签名人: digitalSignatureUserName || '',
        单位: unit || '',
        父级二维码: containerCode || '',
        质量状态: _qcStatus ? _qcStatus.name : '',
        备注: remark || '',
      },
      adjustContainers,
    );

    // 将格式化后的数据按照header的顺序排序。不存在的header就自动被过滤了
    const res = [];
    const headers = getHeaders(useSignStatus);
    headers.forEach(i => {
      res.push(baseData[i]);
    });

    return res;
  });
};

export const getQrCodeDetailUrl = materialId => `/stock/storageAdjustRecord/${materialId}/qrCodeDetail`;

