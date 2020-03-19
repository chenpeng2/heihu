import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { Button, selectAllExport } from 'src/components';
import { exportStorages } from 'src/services/knowledgeBase/storage';
import { getQuery } from 'src/routes/getRouteParams';
import moment from 'src/utils/time';

type Props = {
  style: {},
  match: any,
};

class DataExport extends Component {
  props: Props;
  state = {
    data: null,
  };

  formatExportData = data => {
    const _data = data.map(x => {
      const { code, qrCode, name, remark, parentCode, level } = x || {};

      return {
        parentLevel: level === 1 ? '仓库' : '一级仓位',
        parentCode: parentCode || '',
        name: name || '',
        code: code || '',
        qrCode: qrCode || '',
        remark: remark || '',
      };
    });

    return _data.map(x => Object.values(x));
  };

  dataExport = async () => {
    const { match } = this.props;
    let { data } = this.state;
    const query = getQuery(match) || {};
    const { search, warehouseCode, warehouseStatus, warehouseType, storageStatus } = query;
    const _params = {
      category: warehouseType && warehouseType.key,
      status: storageStatus && storageStatus.key,
      search,
      warehouseCode: warehouseCode && warehouseCode.key,
      warehouseStatus: warehouseStatus && warehouseStatus.key,
    };
    if (!data) {
      const res = await exportStorages(_params);
      const _data = _.get(res, 'data');
      this.setState({ data: _data });
      data = _data;
    }
    const { count } = data;
    selectAllExport(
      {
        width: '30%',
      },
      {
        selectedAmount: count,
        getExportData: async params => {
          const headers = [
            '上级位置类型',
            '上级位置编码',
            '仓位名称',
            '仓位编码',
            '二维码',
            // '仓位质量管理',
            // '质量状态',
            '备注',
          ];
          const res = await exportStorages({ ..._params, ...params });
          const exportData = _.get(res, 'data.data');
          const values = this.formatExportData(exportData);
          return [headers, ...values];
        },
        fileName: `仓位导出-${moment().format('YYYY-MM-DD')}`,
      },
    );
  };

  render() {
    const { style } = this.props;
    return (
      <Button icon={'upload'} style={style} onClick={this.dataExport}>
        导出仓位
      </Button>
    );
  }
}

export default withRouter(DataExport);
