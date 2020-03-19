import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { getSplitRecordList } from 'src/services/stock/splitRecord';
import { setLocation, getParams } from 'src/utils/url';
import { Spin } from 'src/components';
import log from 'src/utils/log';

import Filter, { formatFilterValueForSearch } from './filter';
import Table from './table';

class List extends Component {
  state = {
    loading: false,
    splitRecordData: [],
    total: 0,
  };

  getSplitRecordData = async params => {
    this.setState({ loading: true });

    const { filter: nextFilter, ...rest } = params || {};

    const { queryObj } = getParams();
    const { filter, ...lastRest } = queryObj || {};

    const _nextFilter = { ...filter, ...nextFilter };
    const nextQuery = { page: 1, size: 10, ...lastRest, ...formatFilterValueForSearch(_nextFilter), ...rest };

    // 将参数设置到url中
    setLocation(this.props, { filter: _nextFilter, ...lastRest, ...rest, searchParams: nextQuery });

    try {
      const res = await getSplitRecordList(nextQuery);
      const { data, total } = _.get(res, 'data');
      this.setState({ splitRecordData: data, total });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading, splitRecordData, total } = this.state;
    return (
      <Spin spinning={loading}>
        <div>
          <Filter refetch={this.getSplitRecordData} />
          <Table refetch={this.getSplitRecordData} tableData={splitRecordData} dataTotalAmount={total} />
        </div>
      </Spin>
    );
  }
}

List.propTypes = {
  style: PropTypes.object,
};

export default List;
