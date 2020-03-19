import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { Checkbox, Button, Spin, selectAllExport } from 'src/components';
import Table from 'src/containers/storageAdjustRecord/list/table';
import Filter, { formatFilerFormValue } from 'src/containers/storageAdjustRecord/list/filter';
import { getTransactionLogs } from 'src/services/inventory';
import { setLocation, getParams } from 'src/utils/url';
import { exportXlsxFile } from 'src/utils/exportFile';
import log from 'src/utils/log';
import { queryESignatureStatus, E_SIGN_SERVICE_TYPE } from 'src/services/knowledgeBase/eSignature';
import { border } from 'src/styles/color';
import { arrayIsEmpty } from 'src/utils/array';
import { formatTodayUnderline } from 'src/utils/time';

import { getHeaders, formatExportData } from './utils';

const FILE_NAME = `事务记录数据_${formatTodayUnderline()}`;

type Props = {
  style: {},
  match: any,
};

class List extends Component {
  state = {
    loading: false,
    signStatus: false,
    transactions: [],
    isBatchOperation: false, // 批量操作的开关
    isAllChecked: false, // 是否全选
    selectedRows: [], // 选中的行
    selectedRowKeys: [], // 选中行的key
    selectedAmount: 0, // 选中的数量。全选的时候不可以用selectedRows的length,所以单独加一个state
  };
  props: Props;

  async componentDidMount() {
    // 这个服务是否使用了电子签名
    const res = await queryESignatureStatus(E_SIGN_SERVICE_TYPE.MATERIAL_LOT_ADJUST);
    const signStatus = _.get(res, 'data.data');
    this.setState({ signStatus });
  }

  fetchAndSetData = params => {
    this.setState({ loading: true });

    const { filter, ...rest } = params || {};
    const { filter: lastFilter, ...lastRest } = _.get(getParams(), 'queryObj');

    const nextFilter = { ...lastFilter, ...filter };
    const nextParams = { size: 10, page: 1, ...lastRest, ...formatFilerFormValue(nextFilter), ...rest };

    setLocation(this.props, { size: 10, page: 1, ...lastRest, filter: nextFilter, ...rest });
    getTransactionLogs(nextParams)
      .then(res => {
        const { data, total } = _.get(res, 'data') || {};

        this.setState({
          transactions: data,
          total,
          queryParams: nextParams,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderHeader = () => {
    const { total, isBatchOperation, isAllChecked, selectedAmount } = this.state;
    const { changeChineseTemplateToLocale } = this.context;

    if (isBatchOperation) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox
            style={{ marginLeft: 23 }}
            checked={isAllChecked}
            onChange={e => {
              const checked = e.target.checked;
              this.setState({
                isAllChecked: checked,
                selectedRows: [],
                selectedRowKeys: [],
                selectedAmount: checked ? total || 0 : 0,
              });
            }}
          >
            全选
          </Checkbox>
          <Button disabled={selectedAmount === 0} style={{ width: 80, height: 28 }} onClick={this.handleExport}>
            确定
          </Button>
          <Button
            style={{ width: 80, height: 28, margin: '0 20px' }}
            type={'default'}
            onClick={() => {
              this.setState({ isBatchOperation: false, isAllChecked: false, selectedRowKeys: [], selectedRows: [] });
            }}
          >
            取消
          </Button>
          <span>
            {changeChineseTemplateToLocale('已选{amount}条', { amount: selectedAmount })}
          </span>
        </div>
      );
    }

    return (
      <Button
        icon="upload"
        onClick={() => {
          this.setState({ isBatchOperation: true });
        }}
        disabled={total === 0}
      >
        批量导出
      </Button>
    );
  };

  dataExport = data => {
    const useESign = this.state.signStatus;

    const headers = getHeaders(useESign);
    exportXlsxFile([headers, ...formatExportData(data, useESign)], FILE_NAME);
  };

  handleExport = () => {
    const { queryParams, signStatus } = this.state;
    const { selectedRows, isAllChecked, total } = this.state;

    if (isAllChecked) {
      selectAllExport(
        {
          width: '30%',
        },
        {
          selectedAmount: isAllChecked ? total : arrayIsEmpty(selectedRows) ? 0 : selectedRows.length,
          getExportData: async params => {
            const headers = getHeaders(this.state.signStatus);
            const res = await getTransactionLogs({ ...queryParams, ...params }).catch(e => log.error(e));
            const exportData = _.get(res, 'data.data') || {};
            const values = formatExportData(exportData || [], signStatus);
            return [headers, ...values];
          },
          fileName: FILE_NAME,
        },
      );
    } else {
      this.dataExport(selectedRows);
    }
  };

  renderTable = () => {
    const { selectedRows, transactions, total, isBatchOperation, isAllChecked } = this.state;

    const _transactions = arrayIsEmpty(transactions)
      ? []
      : transactions.map(i => {
          if (i) {
            i.key = i.recordCode;
          }
          return i;
        });

    const getRowSelections = () => {
      // 没有开始批量操作不显示rowSelection
      if (!isBatchOperation) return null;

      return {
        selectedRowKeys: this.state.selectedRowKeys,
        onChange: (selectedRowKeys, _selectedRows) => {
          const newSelectedRows = _.pullAllBy(selectedRows, transactions, 'key').concat(_selectedRows);
          this.setState({
            selectedRowKeys,
            selectedRows: newSelectedRows,
            selectedAmount: arrayIsEmpty(newSelectedRows) ? 0 : newSelectedRows.length,
          });
        },
        getCheckboxProps: () => ({ disabled: isAllChecked }),
      };
    };

    return (
      <Table rowSelection={getRowSelections()} data={_transactions} total={total} fetchData={this.fetchAndSetData} />
    );
  };

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <div>
          <Filter fetchData={this.fetchAndSetData} />
          <div style={{ borderTop: `1px solid ${border}`, padding: '10px 20px' }}>{this.renderHeader()}</div>
          {this.renderTable()}
        </div>
      </Spin>
    );
  }
}

List.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default List;
