import React, { Component } from 'react';
import _ from 'lodash';

import { Spin } from 'src/components';
import Filter, { formatFilerFormValue } from 'src/containers/qrCodeQuery/list/filter';
import Table from 'src/containers/qrCodeQuery/list/table';
import { getMaterialLotList } from 'src/services/stock/material';
import { setLocation, getParams } from 'src/utils/url';
import { border } from 'src/styles/color';
import log from 'src/utils/log';

type Props = {
  style: {},
  match: any,
};

class List extends Component {
  props: Props;
  state = {
    data: [],
    loading: false,
    pagination: { current: 1, pageSize: 10, total: 0 },
    isFilterOpen: true,
  };

  fetchAndSetData = p => {
    // 将url中的值获取到, 设置为参数
    // params中需要url的query是为了刷新的时候可以保持状态
    const { queryObj } = getParams();

    const { filter, ...rest } = p || {};

    const { filter: lastFilter, ...lastRest } = queryObj || {};
    const nextFilter = { ...lastFilter, ...filter };
    const nextQuery = { size: 10, page: 1, ...lastRest, ...rest, ...(formatFilerFormValue(nextFilter) || {}) };

    // 将参数设置到url中
    setLocation(this.props, { size: 10, page: 1, ...lastRest, ...rest, filter: nextFilter });

    this.setState({ loading: true });
    getMaterialLotList(nextQuery)
      .then(res => {
        const { data, total } = _.get(res, 'data');
        this.setState({
          data,
          pagination: { current: nextQuery ? nextQuery.page : 1, pageSize: nextQuery ? nextQuery.size : 10, total },
        });
      })
      .catch(e => log.error(e))
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderFilter = () => {
    return (
      <Filter
        cbForFold={isOpen => {
          this.setState({ isFilterOpen: isOpen });
        }}
        fetchData={this.fetchAndSetData}
      />
    );
  };

  renderTable = () => {
    const { data, pagination, isFilterOpen } = this.state;

    return (
      <Table filterHeight={isFilterOpen ? 500 : 300} pagination={pagination} style={{ margin: '0px 20px' }} data={data} fetchData={this.fetchAndSetData} />
    );
  };

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <div>
          {this.renderFilter()}
          <div style={{ height: 1, borderTop: `1px solid ${border}` }} />
          {this.renderTable()}
        </div>
      </Spin>
    );
  }
}

export default List;
