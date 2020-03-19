import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { border } from 'src/styles/color/index';
import { queryTransferApplyList } from 'src/services/cooperate/materialRequest';
import { getParams, setLocation } from 'src/utils/url';
import { Spin } from 'src/components/index';
import log from 'src/utils/log';

import Table from './table';
import Filter, { formatFilterData } from './filter';

class List extends Component {
  state = {
    loading: false,
    data: [],
    total: 0,
  };

  fetchAndSetData = async params => {
    this.setState({ loading: true });

    const { filter, ...rest } = params || {};
    const { queryObj } = getParams();
    const { filter: lastFilter, ...lastRest } = queryObj || {};

    const nextFilter = { ...lastFilter, ...filter };
    const filterValueAfterFormat = formatFilterData(nextFilter);
    // noMove来自后端接口需要
    const nextParams = { noMove: true, page: 1, size: 10, ...lastRest, ...filterValueAfterFormat, ...rest };

    setLocation(this.props, { page: 1, size: 10, ...lastRest, ...rest, filter: nextFilter });

    try {
      const res = await queryTransferApplyList({ ...nextParams, size: nextParams.pageSize || 10 });
      const { data, total } = _.get(res, 'data');

      this.setState({
        data,
        total,
      });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { data, total, loading } = this.state;
    return (
      <Spin spinning={loading}>
        <Filter refetch={this.fetchAndSetData} />
        <div style={{ borderTop: `1px solid ${border}` }} />
        <Table refetch={this.fetchAndSetData} dataTotal={total} tableData={data} />
      </Spin>
    );
  }
}

List.propTypes = {
  style: PropTypes.object,
};

export default List;
