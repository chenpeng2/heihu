// 盘点记录
import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { border } from 'src/styles/color';

import { setLocation, getParams } from 'src/utils/url';
import { Spin } from 'src/components';
import Table from 'src/containers/stockCheckRecord/list/table';
import Filter, { formatFormValue } from 'src/containers/stockCheckRecord/list/filter';
import { getStockCheckedRecord } from 'src/services/stock/stockCheckedRecord';
import log from 'src/utils/log';

class StockCheckRecord extends Component {
  state = {
    loading: false,
    data: [],
    total: 0,
  };

  fetchAndSetData = async params => {
    const { queryObj } = getParams();
    const { filter: lastFilter, ...lastRest } = queryObj || {};

    const { filter, ...rest } = params || {};

    const nextFilter = { ...lastFilter, ...filter };
    const nextQuery = {
      size: 10,
      ...lastRest,
      ...formatFormValue(nextFilter, { secondStorageIdsType: 'string' }),
      ...rest,
    };
    this.setState({ loading: true });

    setLocation(this.props, { filter: nextFilter, ...lastRest, ...rest });
    try {
      const res = await getStockCheckedRecord(nextQuery);
      const { data, total } = _.get(res, 'data') || {};

      this.setState({ data, total });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  renderTable = () => {
    const { data, total } = this.state;

    return <Table total={total} data={data} refetch={this.fetchAndSetData} />;
  };

  renderFilter = () => {
    return <Filter fetchAndSetData={this.fetchAndSetData} />;
  };

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <div>
          {this.renderFilter()}
          <div style={{ borderBottom: `1px solid ${border}` }} />
          {this.renderTable()}
        </div>
      </Spin>
    );
  }
}

StockCheckRecord.propTypes = {
  style: PropTypes.object,
  match: PropTypes.any,
};

export default withRouter(StockCheckRecord);
