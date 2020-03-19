/**
 * @description: 点击展开按钮显示的table
 *
 * @date: 2019/4/30 下午12:20
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Table, Tooltip } from 'src/components';
import { getReportsSupplier, getReportsInboundBatch, getReportsMfgBatch } from 'src/services/stock/inventoryReport';
import log from 'src/utils/log';
import { replaceSign } from 'src/constants';
import { primary } from 'src/styles/color';
import {} from 'src/utils/url';

import { COLLECT_WAY } from './utils';

class ExpandTable extends Component {
  state = {
    tableData: [],
    loading: false,
  };

  componentDidMount() {
    this.fetchData();
  }

  componentWillReceiveProps(nextProps) {
    // type的改变需要重新拉取数据
    // 行数据改变也要重新拉取数据
    if (!_.isEqual(this.props.type, nextProps.type) || !_.isEqual(this.props.recordData, nextProps.recordData)) {
      this.fetchData(nextProps);
    }
  }

  fetchData = async props => {
    const { type, recordData } = props || this.props;

    const { warehouseCode, materialInfo } = recordData || {};
    const materialCode = _.get(materialInfo, 'code');
    const params = { warehouseCode, materialCode };

    this.setState({ loading: true });

    try {
      let res;
      // 按照供应商批次汇总
      if (type === COLLECT_WAY.supplyBatch.value) {
        res = await getReportsMfgBatch(params);
      }
      // 按照供应商汇总
      if (type === COLLECT_WAY.supply.value) {
        res = await getReportsSupplier(params);
      }
      // 按照入厂批次汇总
      if (type === COLLECT_WAY.init.value) {
        res = await getReportsInboundBatch(params);
      }

      const data = _.get(res, 'data.data');
      this.setState({ tableData: data });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  getColumns = () => {
    const { type, recordData } = this.props;
    const { warehouseId, warehouseCode, materialInfo } = recordData || {};
    const { changeChineseToLocale } = this.context;
    const { unitName, code: materialCode, name: materialName } = materialInfo || {};

    const materialValue = { key: materialCode, label: `${materialCode}/${materialName}` };
    const areaValue = [`${warehouseId},${warehouseCode},${1}`];

    let columns = [];
    const baseColumns = [
      {
        title: '数量',
        dataIndex: 'amount',
        render: data => {
          const text = typeof data === 'number' ? `${data} ${unitName || replaceSign}` : replaceSign;
          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '操作',
        key: 'operation',
        render: (__, record) => {
          const { supplierCode, mfgBatches, inboundBatch } = record || {};
          return (
            <span
              onClick={() => {
                const baseParams = { filter: { area: areaValue, material: materialValue } };
                if (type === COLLECT_WAY.supply.value) {
                  baseParams.filter.supplierCode = supplierCode;
                }
                if (type === COLLECT_WAY.supplyBatch.value) {
                  // 其他批次为null。
                  if (mfgBatches === '其他批次') {
                    baseParams.filter.mfgBatch = null;
                  } else {
                    baseParams.filter.mfgBatch = mfgBatches;
                  }
                }
                if (type === COLLECT_WAY.init.value) {
                  // 其他批次为null。
                  if (inboundBatch === '其他批次') {
                    baseParams.filter.inboundBatch = null;
                  } else {
                    baseParams.filter.inboundBatch = inboundBatch;
                  }
                }
                const url = `/stock/qrCode?query=${encodeURIComponent(JSON.stringify(baseParams))}`;
                window.open(url);
              }}
              style={{ color: primary, cursor: 'pointer' }}
            >
              {changeChineseToLocale('查看明细')}
            </span>
          );
        },
      },
    ];
    // 按照供应商批次汇总
    if (type === COLLECT_WAY.supplyBatch.value) {
      columns = columns
        .concat([
          {
            title: '供应商批次',
            dataIndex: 'mfgBatches',
            render: data => <Tooltip text={data || replaceSign} length={20} />,
          },
        ])
        .concat(baseColumns);
    }
    // 按照供应商汇总
    if (type === COLLECT_WAY.supply.value) {
      columns = columns
        .concat([
          {
            title: '供应商',
            key: 'supply',
            render: (__, record) => {
              const { supplierCode, supplierName } = record || {};
              const text = !supplierCode
                ? `${supplierName || replaceSign}`
                : `${supplierCode || replaceSign}/${supplierName || replaceSign}`;
              return <Tooltip text={text} length={20} />;
            },
          },
        ])
        .concat(baseColumns);
    }
    // 按照入厂批次汇总
    if (type === COLLECT_WAY.init.value) {
      columns = columns
        .concat([
          {
            title: '入厂批次',
            dataIndex: 'inboundBatch',
            render: data => <Tooltip text={data || replaceSign} length={20} />,
          },
        ])
        .concat(baseColumns);
    }
    return columns;
  };

  render() {
    const { tableData, loading } = this.state;
    return <Table loading={loading} columns={this.getColumns()} dataSource={tableData || [1]} pagination={false} />;
  }
}

ExpandTable.propTypes = {
  style: PropTypes.object,
  type: PropTypes.any,
  recordData: PropTypes.any,
};

ExpandTable.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default ExpandTable;
