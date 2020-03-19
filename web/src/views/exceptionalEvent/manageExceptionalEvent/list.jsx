import React, { Component } from 'react';
import _ from 'lodash';

import { FormattedMessage, message, Spin, Button, Checkbox, selectAllExport } from 'src/components';
import Filter, { formatFilterFormValue } from 'src/containers/exceptionalEvent/management/filter';
import Table from 'src/containers/exceptionalEvent/management/table';
import { getEventList } from 'src/services/exceptionalEvent';
import { setLocation, getParams } from 'src/utils/url';
import { border } from 'src/styles/color';
import moment, { formatRangeTimeToMoment } from 'src/utils/time';
import { exportXlsxFile } from 'src/utils/exportFile';
import { arrayIsEmpty } from 'src/utils/array';

import { formatExportData } from '../utils';

const FILE_NAME = `异常事件导出文件_${moment().format('YYYYMMDDHHmmss')}`;
const fetchData = async params => {
  const res = await getEventList(params);
  return _.get(res, 'data');
};

type Props = {
  style: {},
  match: {},
};

class ExceptionalEventManagement extends Component {
  props: Props;
  state = {
    eventListData: null,
    loading: false,
    totalAmount: 0,
    isSelectModel: false, // 是否进入选择模式
    isSelectAll: false, // 是否全选
    selectedRows: [], // 选中行的数据
    selectedRowKeys: [], // 选中行的key
  };

  componentDidMount() {
    this.fetchAndSetState();
  }

  fetchAndSetState = async params => {
    this.setState({ loading: true });

    const { filter, ...rest } = params || {};
    const { filter: lastFilter, ...lastRest } = _.get(getParams(), 'queryObj') || {};

    const nextFilter = { ...lastFilter, ...filter };
    const nextParams = { size: 10, page: 1, ...lastRest, ...(formatFilterFormValue(nextFilter) || {}), ...rest };

    // 将参数设置到url中
    setLocation(this.props, { size: 10, page: 1, ...lastRest, filter: nextFilter, ...rest });
    fetchData(nextParams)
      .then(res => {
        const { data, total } = res || {};
        this.setState({
          eventListData: data,
          totalAmount: total,
          fetchParams: nextParams,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getTableRowSelection = tableData => {
    const { selectedRows = [], selectedRowKeys = [], isSelectAll } = this.state;
    return {
      selectedRowKeys,
      onChange: (selectedRowKeys, _selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedRows: _.pullAllBy(selectedRows, tableData, 'key').concat(_selectedRows),
        });
      },
      getCheckboxProps: () => ({ disabled: isSelectAll }), // 全选的时候disable
    };
  };

  // 返回开始的状态
  backInitialState = extraState => {
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
      isSelectAll: false,
      isSelectModel: false,
      ...extraState,
    });
  };

  // 获取选中数据的数量
  getSelectedAmount = () => {
    const { totalAmount, isSelectAll, selectedRowKeys } = this.state;
    if (isSelectAll) return totalAmount;
    if (!isSelectAll && !arrayIsEmpty(selectedRowKeys)) return selectedRowKeys.length;
    return 0;
  };

  render() {
    const { isSelectAll, loading, eventListData, totalAmount, isSelectModel } = this.state;

    const _eventListData = arrayIsEmpty(eventListData)
      ? []
      : eventListData
          .map(i => {
            if (i) i.key = i.code;
            return i;
          })
          .filter(i => i);

    const buttonStyle = {
      width: 80,
      marginLeft: 10,
    };

    return (
      <div>
        <Spin spinning={loading}>
          <Filter
            fetchData={params => {
              this.backInitialState();
              this.fetchAndSetState(params);
            }}
          />
          <div style={{ borderTop: `1px solid ${border}`, marginBottom: 20 }} />
          <div style={{ margin: '0px 20px 20px' }}>
            {isSelectModel ? (
              <div>
                <Checkbox
                  value={isSelectAll}
                  style={{ display: 'inline-block' }}
                  onChange={e => {
                    const value = e.target.value;
                    this.backInitialState({
                      isSelectModel: true,
                      isSelectAll: !value,
                    });
                  }}
                >
                  全选
                </Checkbox>
                <Button
                  style={buttonStyle}
                  onClick={() => {
                    const { selectedRows, fetchParams } = this.state;
                    // 全选的时候批量导出
                    if (isSelectAll) {
                      // 全选导出的时候限制报告时间范围为31天
                      const filter = _.get(getParams(), 'queryObj.filter', {});
                      const { timeFrom, timeTill } = filter;
                      if (!(timeTill && timeFrom)) {
                        message.error('全选导出需要选择报告时间');
                        return;
                      }

                      if (timeFrom && timeTill && moment(timeTill).diff(moment(timeFrom), 'days') > 31) {
                        message.error('全选导出报告时间不可以超过31天');
                        return;
                      }

                      selectAllExport(
                        {
                          width: '30%',
                        },
                        {
                          selectedAmount: totalAmount || 0,
                          getExportData: async _params => {
                            const res = await fetchData({ ...fetchParams, ..._params });
                            const exportData = _.get(res, 'data') || {};
                            return formatExportData(exportData || []);
                          },
                          fileName: FILE_NAME,
                          maxExportAmount: 1000, // 一次最多导出1000条
                        },
                      );
                    } else {
                      // 选择行导出
                      const values = formatExportData(selectedRows || []);
                      exportXlsxFile(values, FILE_NAME);
                    }

                    this.backInitialState();
                  }}
                  disabled={this.getSelectedAmount() <= 0}
                >
                  确定
                </Button>
                <Button
                  style={buttonStyle}
                  type={'default'}
                  onClick={() => {
                    this.backInitialState();
                  }}
                >
                  取消
                </Button>
                <FormattedMessage style={{ marginLeft: 10 }} defaultMessage={'已选{amount}条'} values={{ amount: this.getSelectedAmount() }} />
              </div>
            ) : (
              <Button
                onClick={() => {
                  this.setState({ isSelectModel: true });
                }}
                disabled={totalAmount <= 0}
              >
                批量导出异常事件
              </Button>
            )}
          </div>
          <Table
            rowSelection={isSelectModel ? this.getTableRowSelection(_eventListData) : null}
            fetchData={this.fetchAndSetState}
            data={_eventListData}
            totalAmount={totalAmount}
          />
        </Spin>
      </div>
    );
  }
}

export default ExceptionalEventManagement;
