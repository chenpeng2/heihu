import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { selectAllExport, Checkbox, FormattedMessage, message, openModal, Button } from 'src/components';
import { arrayIsEmpty } from 'src/utils/array';
import { batchClearQrCodeWithTransaction } from 'src/services/stock/material';
import log from 'src/utils/log';
import { primary, fontSub } from 'src/styles/color';
import moment from 'src/utils/time';
import { exportXlsxFile } from 'src/utils/exportFile';
import { findLocationStatus, findTrallyingStatus } from 'src/containers/qrCodeQuery/utils';
import { QUALITY_STATUS } from 'src/views/qualityManagement/constants';
import { replaceSign } from 'src/constants';
import { getValidityPeriodPrecision } from 'src/utils/organizationConfig';

import EnSureForClearQrcode from './ClearQrCodeModal';

export const TYPE = {
  export: 'export',
  clear: 'clear',
};

const getFileName = name => `${moment().format('YYYYDD')}_${name || '监控台'}`;

const formatExportData = data => {
  const unitsLength = data.map(n => (n.unitConversions && n.unitConversions.length) || 0);
  const maxLength = Math.max(...unitsLength);

  // header处理
  const headers = [
    '位置状态',
    '二维码',
    '物料编号',
    '物料名称',
    '规格描述',
    '仓位编号',
    '仓位名称',
    '数量',
    '单位',
    '销售订单',
    '项目编号',
    '质量状态',
    '盘点状态',
    '父级二维码',
    '供应商编号',
    '供应商名称',
    '供应商批次',
    '入厂批次',
    '创建时间',
    '使用时间',
    '有效期',
    '质检时间',
    '上次盘点时间',
    '备注',
  ];
  if (maxLength > 0) {
    for (let i = 0; i < maxLength; i += 1) {
      headers.splice(9 + i * 2, 0, '数量', '单位');
    }
  }

  // value处理
  const { showFormat } = getValidityPeriodPrecision() || {};
  const values = data.map(x => {
    const {
      mfgBatches,
      containerCode,
      status,
      inboundBatch,
      purchaseOrderCode,
      projectCode,
      code,
      material,
      storageInfo,
      amount,
      supplier,
      qcStatus,
      createdAt,
      remark,
      qualityInspectTime,
      validityPeriod,
      trallyingAt,
      unitConversions,
    } = x || {};
    const { unit: unitName } = material || {};
    const _trallyingStatus = findTrallyingStatus(x);
    const locationStatus = findLocationStatus(status);

    const exportObj = {
      locationStatus: locationStatus ? locationStatus.name : null,
      qrCode: code || null,
      materialCode: material ? material.code : null,
      materialName: material ? material.name : null,
      desc: material ? material.desc : null,
      storageCode: storageInfo ? storageInfo.code : null,
      storageName: storageInfo ? storageInfo.name : null,
      amount,
      unit: unitName || '',
      purchaseOrderCode: purchaseOrderCode || null,
      projectCode: projectCode || null,
      qcStatus: QUALITY_STATUS[qcStatus] ? QUALITY_STATUS[qcStatus].name : null,
      trallyingStatus: _trallyingStatus ? _trallyingStatus.name : null,
      containerCode: containerCode || replaceSign,
      supplierCode: supplier ? supplier.code : null,
      supplierName: supplier ? supplier.name : null,
      mfgBatches:
        mfgBatches && Array.isArray(mfgBatches) && mfgBatches.length
          ? mfgBatches.map(({ mfgBatchNo }) => mfgBatchNo).join(',')
          : null,
      inboundBatch: inboundBatch || null,
      createdAt: createdAt ? moment(createdAt).format('YYYY/MM/DD HH:mm') : null,
      useTime: moment(createdAt).fromNow(true),
      validityPeriod: validityPeriod ? moment(validityPeriod).format(showFormat) : null,
      qcTime: qualityInspectTime ? moment(qualityInspectTime).format('YYYY/MM/DD HH:mm') : null,
      trallyingAt: trallyingAt ? moment(trallyingAt).format('YYYY/MM/DD HH:mm') : null,
      remark,
    };
    const exportData = Object.values(exportObj);
    if (maxLength > 0) {
      for (let i = 0; i < maxLength; i += 1) {
        const units = unitConversions && unitConversions[i];
        exportData.splice(9 + i * 2, 0, (units && units.amount) || '', (units && units.unit) || '');
      }
    }
    return exportData;
  });

  return [headers, ...values];
};

const RowSelectionHeader = props => {
  const [allChecked, setAllChecked] = useState(false);
  const {
    conditionData,
    fetchData,
    type,
    cbForAllChecked,
    selectedRowKeys,
    total,
    selectedRows,
    cbForClearQrCode,
    cbForCancel,
  } = props || {};

  return (
    <React.Fragment>
      {type === TYPE.export ? (
        <React.Fragment>
          <FormattedMessage
            style={{ lineHeight: '28px', color: fontSub }}
            defaultMessage={'已选{amount}条'}
            values={{
              amount: (
                <span style={{ color: primary, margin: '0px 2px' }}>
                  {allChecked ? total : Array.isArray(selectedRowKeys) ? selectedRowKeys.length : 0}
                </span>
              ),
            }}
          />
          <Checkbox
            onChange={e => {
              setAllChecked(e.target.checked);
              cbForAllChecked(e.target.checked);
            }}
            checked={allChecked}
            style={{ display: 'inline-block', margin: '0px 10px' }}
          >
            全选
          </Checkbox>
          <Button
            onClick={() => {
              if (allChecked) {
                selectAllExport(
                  {
                    width: '30%',
                  },
                  {
                    selectedAmount: allChecked ? total : selectedRows.length,
                    getExportData: async params => {
                      const res = await fetchData({ ...params });
                      const exportData = _.get(res, 'data.data') || [];
                      return formatExportData(exportData);
                    },
                    fileName: getFileName(conditionData ? conditionData.name : null),
                  },
                );
              } else if (!arrayIsEmpty(selectedRows)) {
                // 选择行导出
                const values = formatExportData(selectedRows || []);
                exportXlsxFile(values, getFileName(conditionData ? conditionData.name : null));
              } else {
                message.warn('请选择二维码');
              }
            }}
          >
            确认导出
          </Button>
        </React.Fragment>
      ) : null}
      {type === TYPE.clear ? (
        <span style={{ lineHeight: '28px', color: fontSub }}>
          <FormattedMessage defaultMessage={'每次最多置空100条'} />
          <span>,</span>
          <FormattedMessage
            defaultMessage={'已选{amount}条'}
            values={{
              amount: (
                <span style={{ color: primary, margin: '0px 2px' }}>
                  {Array.isArray(selectedRowKeys) ? selectedRowKeys.length : 0}
                </span>
              ),
            }}
          />
          <Button
            style={{ marginLeft: 10 }}
            onClick={() => {
              if (!arrayIsEmpty(selectedRowKeys)) {
                openModal({
                  width: 500,
                  children: <EnSureForClearQrcode amount={selectedRowKeys.length} />,
                  onOk: async () => {
                    try {
                      const res = await batchClearQrCodeWithTransaction({
                        ids: selectedRowKeys,
                        transactionCode: 'BL003',
                      });
                      const { data: messageData } = _.get(res, 'data') || {};
                      // 批量置空二维码的时候。如果因为业务状态的原因部分成功需要有提示
                      if (!arrayIsEmpty(messageData)) {
                        message.error(messageData.join(','));
                      } else {
                        message.success('清空二维码成功');
                      }

                      if (typeof cbForClearQrCode === 'function') cbForClearQrCode(res);

                      // 清空二维码后需要重新拉取数据
                      if (typeof fetchData === 'function') {
                        fetchData();
                      }
                    } catch (e) {
                      log.error(e);
                    }
                  },
                });
              } else {
                message.warn('请选择二维码');
              }
            }}
          >
            确认置空
          </Button>
        </span>
      ) : null}
      <Button
        onClick={() => {
          if (typeof cbForCancel === 'function') cbForCancel();
        }}
        type={'ghost'}
        style={{ marginLeft: 20 }}
      >
        取消
      </Button>
    </React.Fragment>
  );
};

RowSelectionHeader.propTypes = {
  style: PropTypes.any,
  conditionData: PropTypes.any,
};

export default RowSelectionHeader;
