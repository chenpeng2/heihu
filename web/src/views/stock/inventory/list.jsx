import React, { Component } from 'react';
import _ from 'lodash';

import { Spin } from 'src/components';
import Filter, { formatFilterValueForSearch } from 'src/containers/inventory/list/filter';
import Table from 'src/containers/inventory/list/table';
import DataExport from 'src/containers/inventory/list/dataExport';
import { getInventoryList } from 'src/services/inventory';
import { setLocation, getParams } from 'utils/url';

type Props = {
  style: {},
  match: any,
};

class List extends Component {
  props: Props;
  state = {
    data: [],
    total: 0,
    loading: false,
  };

  fetchAndSetData = params => {
    // 将url中的值获取到, 设置为参数

    const { filter: nextFilter, ...rest } = params || {};

    const { queryObj } = getParams();
    const { filter, ...lastRest } = queryObj || {};

    const _nextFilter = { ...filter, ...nextFilter };
    const nextQuery = { ...lastRest, ...formatFilterValueForSearch(_nextFilter), ...rest };

    // 将参数设置到url中
    setLocation(this.props, { filter: _nextFilter, ...lastRest, ...rest });

    this.setState({ loading: true });
    getInventoryList(nextQuery)
      .then(res => {
        const { data, total } = _.get(res, 'data');

        this.setState({
          data,
          total,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderFilter = () => {
    return <Filter fetchData={this.fetchAndSetData} />;
  };

  renderExportData = () => {
    return <DataExport />;
  };

  renderTable = () => {
    const { data, total } = this.state;

    return <Table data={data} total={total} fetchData={this.fetchAndSetData} />;
  };

  render() {
    return (
      <Spin spinning={this.state.loading}>
        {this.renderFilter()}
        {this.renderExportData()}
        {this.renderTable()}
      </Spin>
    );
  }
}

export default List;
