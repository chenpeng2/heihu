import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import log from 'src/utils/log';
import { getCustomRuleList } from 'src/services/systemConfig/customRule';
import { Spin } from 'src/components';

import Table from './table';

class List extends Component {
  state = {
    tableData: [],
    loading: false,
  };

  componentDidMount() {
    this.fetchAndSetTableData();
  }

  fetchAndSetTableData = async () => {
    this.setState({ loading: true });

    try {
      const res = await getCustomRuleList();
      const data = _.get(res, 'data.data');
      this.setState({ tableData: data });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { tableData, loading } = this.state;
    return (
      <Spin spinning={loading}>
        <div style={{ marginTop: 20 }}>
          <Table refetch={this.fetchAndSetTableData} tableData={tableData} />
        </div>
      </Spin>
    );
  }
}

List.propTypes = {
  style: PropTypes.object,
};

export default List;
