import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin } from 'src/components';
import { getCustomCodeList } from 'src/services/systemConfig/customCode';
import log from 'src/utils/log';

import Table from './table';
import LinkToCreate from '../baseComponent/linkToCreateCustomVinitCodeRule';


class List extends Component {
  state = {
    loading: false,
    tableData: [],
  };

  componentDidMount() {
    this.fetchAndSetTableData();
  }

  fetchAndSetTableData = async () => {
    this.setState({ loading: true });

    try {
      const res = await getCustomCodeList();
      const data = _.get(res, 'data.data');
      this.setState({ tableData: data });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading, tableData } = this.state;

    return (
      <Spin spinning={loading} >
        <LinkToCreate />
        <Table tableData={tableData} />
      </Spin>
    );
  }
}

List.propTypes = {
  style: PropTypes.object,
};

export default List;
