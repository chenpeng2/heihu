import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Button, selectAllExport } from 'src/components';
import { getOutStorageRecords } from 'src/services/inventory';
import { getParams } from 'src/utils/url';
import { findOutStorageTypes } from 'src/containers/materialTransferRecord/util';
import { findQcStatus } from 'src/containers/storageAdjustRecord/util';
import moment from 'src/utils/time';
import { isOrganizationUseQrCode } from 'src/utils/organizationConfig';

type Props = {
  signStatus: Boolean,
  total: Number,
};

class DataExport extends Component {
  props: Props;
  state = {};

  dataExport = () => {
    const { signStatus, total } = this.props;
    const { queryObj } = getParams();
    const query = _.get(queryObj, 'table1.query');
    const useQrCode = isOrganizationUseQrCode();

    selectAllExport(
      {
        width: '30%',
      },
      {
        selectedAmount: total,
        getExportData: async params => {
          const headers = [
            '出库类型',
            useQrCode ? '二维码' : null,
            useQrCode ? '嵌套二维码' : null,
            '出库仓位名称',
            '出库仓位编码',
            '期望出库仓位名称',
            '期望出库仓位编码',
            '物料名称',
            '物料编码',
            '出库数量',
            '单位',
            '质量状态',
            '操作人',
            signStatus && '电子签名人',
            '操作时间',
            '备注',
          ];
          const res = await getOutStorageRecords({ ...query, ...params });
          const exportData = _.get(res, 'data.data');
          const values = this.formatExportData(exportData);
          return [_.compact(headers), ...values];
        },
        fileName: `出库记录_${moment().format('YYYY-MM-DD')}`,
      },
    );
  };

  formatExportData = data => {
    const { signStatus } = this.props;
    const useQrCode = isOrganizationUseQrCode();
    const _data = data.map(x => {
      const {
        amount,
        containerQrcode,
        createdAt,
        materialCode,
        materialName,
        msg,
        operatorName,
        qcStatus,
        qrcode,
        storageCode,
        storageName,
        type,
        unit,
        digitalSignatureUserName,
        targetWarehouseCode,
        targetWarehouseName,
      } = x || {};
      const _type = findOutStorageTypes(type);
      const _qcStatus = findQcStatus(qcStatus);

      const columnsObj = {
        type: _type ? _type.name : '',
        qrcode: qrcode || '',
        containerQrcode: containerQrcode || '',
        storageName: storageName || '',
        storageCode: storageCode || '',
        targetWarehouseCode,
        targetWarehouseName,
        materialName: materialName || '',
        materialCode: materialCode || '',
        amount: typeof amount === 'number' ? String(amount) : '',
        unit: unit || '',
        qcStatus: _qcStatus ? _qcStatus.name : '',
        operatorName: operatorName || '',
        signer: digitalSignatureUserName || '',
        createdAt: createdAt ? moment(createdAt).format('YYYY/MM/DD') : '',
        msg: msg || '',
      };
      if (!useQrCode) {
        delete columnsObj.qrcode;
        delete columnsObj.containerQrcode;
      }
      if (!signStatus) {
        delete columnsObj.signer;
      }
      return columnsObj;
    });

    return _data.map(x => Object.values(x));
  };

  render() {
    const { disabled, ...rest } = this.props;

    return (
      <div {...rest}>
        <Button disabled={disabled} icon={'upload'} onClick={this.dataExport}>
          数据导出
        </Button>
      </div>
    );
  }
}

DataExport.propTypes = {
  style: PropTypes.object,
  disabled: PropTypes.bool,
};

export default DataExport;
