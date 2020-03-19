import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { formatFilterValueForSearch } from 'src/containers/inventory/list/filter';
import { getParams } from 'utils/url';
import { Button } from 'src/components';
import { border } from 'src/styles/color';
import { getInventoryList } from 'src/services/inventory';
import { exportXlsxFile } from 'src/utils/exportFile';
import { replaceSign } from 'src/constants';
import { QUALITY_STATUS } from 'src/views/qualityManagement/constants';
import { ExporterButton } from 'src/components/fileBasedDataExporter';

type Props = {
  style: {},
  match: any,
};

class DataExport extends Component {
  props: Props;
  state = {};

  formatExportData = data => {
    const _data = data.map(x => {
      const { material, storage, amountTotal, amountControlled, amountRequested, qcStatus } = x || {};
      const { unitName } = material || {};

      return {
        materialCode: material ? material.code : null,
        materialName: material ? material.name : null,
        desc: material ? material.desc : null,
        storageCode: storage ? storage.code : null,
        storageName: storage ? storage.name : null,
        amount: amountTotal,
        unit: unitName || '',
        qcStatus: QUALITY_STATUS[qcStatus] ? QUALITY_STATUS[qcStatus].name : null,
        useAmount:
          typeof amountRequested === 'number' && typeof amountControlled === 'number'
            ? `${amountControlled + amountRequested} ${unitName || replaceSign}`
            : `${0} ${unitName || replaceSign}`,
      };
    });

    return _data.map(x => Object.values(x));
  };

  dataExport = () => {
    const { queryObj } = getParams();
    const { filter, ...rest } = queryObj || {};

    const query = { ...formatFilterValueForSearch(filter), ...rest };

    getInventoryList({ ...query, size: 300 }).then(res => {
      const data = _.get(res, 'data.data');
      const headers = [
        '物料编号',
        '物料名称',
        '规格描述',
        '区域编号',
        '区域名称',
        '数量',
        '单位',
        '质量状态',
        '占用数量',
      ];

      exportXlsxFile([headers, ...this.formatExportData(data)], '物料库存');
    });
  };

  render() {
    const { changeChineseToLocale } = this.context;
    return (
      <div style={{ borderTop: `1px solid ${border}`, height: 58, padding: '10px 20px', lineHeight: '38px' }}>
        <span>{changeChineseToLocale('库存查询')}</span>
        <ExporterButton
          dataType={'库存'}
          baseUrl={'/manufacture/v2/inventory/export/daily'}
          generateForPast={false}
          icon={'upload'}
          style={{ float: 'right' }}
        />
      </div>
    );
  }
}

DataExport.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(DataExport);
