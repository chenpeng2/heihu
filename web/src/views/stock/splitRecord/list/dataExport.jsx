import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { formatTodayUnderline, format } from 'utils/time';
import { getQuery } from 'src/routes/getRouteParams';
import { Button, selectAllExport } from 'src/components';
import { getSplitRecordList } from 'src/services/stock/splitRecord';

type Props = {
  style: {},
  match: any,
  dataTotalAmount: Number,
};

class DataExport extends Component {
  props: Props;
  state = {
    data: null,
  };

  formatExportData = data => {
    const _data = data.map(x => {
      const {
        storageName,
        materialName,
        specific,
        qrCode,
        amountBefore,
        amountAfter,
        operatorName,
        digitalSignatureUserName,
        operateTime,
      } = x || {};

      return {
        storageName: storageName || '',
        materialName: materialName || '',
        specific: specific || '',
        qrCode: qrCode || '',
        amountBefore: typeof amountBefore === 'number' ? String(amountBefore) : '',
        amountAfter: typeof amountAfter === 'number' ? String(amountAfter) : '',
        operatorName: operatorName || '',
        digitalSignatureUserName: digitalSignatureUserName || '',
        operateTime: (operateTime && format(operateTime, 'YYYY/MM/DD HH:mm')) || '',
      };
    });

    return _data.map(x => Object.values(x));
  };

  dataExport = async () => {
    const { match, dataTotalAmount } = this.props;
    const query = getQuery(match) || {};
    const { searchParams } = query;
    selectAllExport(
      {
        width: '30%',
      },
      {
        selectedAmount: dataTotalAmount,
        getExportData: async params => {
          const headers = [
            '拆分位置',
            '物料',
            '规格描述',
            '拆分前二维码',
            '原数量',
            '拆分后数量',
            '操作人',
            '电子签名人',
            '操作时间',
          ];
          const res = await getSplitRecordList({ ...searchParams, ...params });
          const exportData = _.get(res, 'data.data');
          const values = this.formatExportData(exportData);
          return [headers, ...values];
        },
        fileName: `拆分记录导出_${formatTodayUnderline()}`,
      },
    );
  };

  render() {
    const { style } = this.props;
    return (
      <Button icon={'upload'} style={{ display: 'inline-block', ...style }} onClick={this.dataExport}>
        批量导出
      </Button>
    );
  }
}

export default withRouter(DataExport);
