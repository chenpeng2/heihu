import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { openModal, Table as BasicTable, Tooltip, Icon } from 'src/components';
import { primary } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import { Big } from 'src/utils/number';

import ExpandRowTable from './expandRowTable';
import TransferApplyTable from './transferApplyTable/transferApplyTable';

class Table extends Component {
  state = {};

  getColumns = () => {
    const { changeChineseToLocale } = this.context;

    return [
      {
        title: '仓库',
        width: 200,
        key: 'warehouse',
        render: (__, data) => {
          const { warehouseCode, warehouseName } = data || {};
          return warehouseName && warehouseCode ? `${warehouseCode}/${warehouseName}` : replaceSign;
        },
      },
      {
        title: '物料',
        width: 200,
        dataIndex: 'materialInfo',
        render: data => {
          const { code, name } = data || {};
          return code && name ? `${code}/${name}` : replaceSign;
        },
      },
      {
        title: '规格描述',
        width: 200,
        key: 'materialDesc',
        render: (__, data) => {
          const { materialInfo } = data || {};
          const { desc } = materialInfo || {};

          return desc || replaceSign;
        },
      },
      {
        title: '可用数量',
        width: 200,
        key: 'freeAmount',
        render: (__, data) => {
          const { materialInfo, controlledAmount, totalAmount } = data || {};
          const unitName = _.get(materialInfo, 'unitName');

          const freeAmount =
            typeof controlledAmount === 'number' && typeof totalAmount === 'number'
              ? new Big(totalAmount).minus(controlledAmount).valueOf()
              : replaceSign;
          return typeof freeAmount === 'number' ? `${freeAmount} ${unitName || replaceSign}` : replaceSign;
        },
      },
      {
        title: (
          <div>
            <span style={{ marginRight: 5 }}>{changeChineseToLocale('总数量')} </span>
            <Tooltip title={changeChineseToLocale('总数量不包含在途的二维码')}>
              <Icon type={'exclamation-circle-o'} style={{ color: primary }} />
            </Tooltip>
          </div>
        ),
        width: 200,
        dataIndex: 'totalAmount',
        render: (data, record) => {
          const unitName = _.get(record, 'materialInfo.unitName');
          return typeof data === 'number' ? `${data} ${unitName || replaceSign}` : replaceSign;
        },
      },
      {
        title: '占用数量',
        dataIndex: 'controlledAmount',
        width: 200,
        render: (data, record) => {
          const unitName = _.get(record, 'materialInfo.unitName');
          return typeof data === 'number' ? `${data} ${unitName || replaceSign}` : replaceSign;
        },
      },
      {
        title: '操作',
        width: 200,
        key: 'operation',
        render: (__, record) => {
          return (
            <span
              onClick={() => {
                openModal({
                  title: changeChineseToLocale('占用信息'),
                  children: <TransferApplyTable data={record} />,
                  innerContainerStyle: { margin: 20, overflow: 'unset' },
                  footer: null,
                }, this.context);
              }}
              style={{ color: primary, cursor: 'pointer' }}
            >
              {changeChineseToLocale('查看占用信息')}
            </span>
          );
        },
      },
    ];
  };

  getExpandedRowRender = collectType => {
    return record => <ExpandRowTable recordData={record} type={collectType} />;
  };

  render() {
    const { refetch, tableData, total, style, collectType, pagination } = this.props;
    // 因为antd目前无法升级，自定义按钮目前无法实现
    return (
      <div style={style}>
        <BasicTable
          refetch={refetch}
          expandedRowRender={this.getExpandedRowRender(collectType)}
          columns={this.getColumns()}
          dataSource={tableData || []}
          total={total || 0}
          pagination={pagination}
          dragable
        />
      </div>
    );
  }
}

Table.propTypes = {
  style: PropTypes.object,
  tableData: PropTypes.any,
  total: PropTypes.any,
  collectType: PropTypes.any,
  refetch: PropTypes.any,
  pagination: PropTypes.any,
};

Table.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Table;
