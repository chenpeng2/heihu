import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import { Spin, Link } from 'src/components';
import { border } from 'src/styles/color';
import Table from 'src/containers/newProcess/list/table';
import Filter from 'src/containers/newProcess/list/filter';
import LinkToCreateProcess from 'src/containers/newProcess/base/linkToCreateProcess';
import { queryProcess } from 'src/services/process';
import { setLocation } from 'utils/url';
import { getLocation, getQuery } from 'src/routes/getRouteParams';
import { getProcessImportListPath } from './utils';
import ImportProcess from './import';

type Props = {
  match: any,
};

const tableUniqueKey = 'ProcessDefinationTableConfig';

class List extends Component {
  props: Props;
  state = {
    data: [], // table data
    total: 0, // data 的总数量
    loading: false, // 等待状态
  };

  componentDidMount() {
    this.fetchAndSetData();
  }

  handleLoading = loading => this.setState({ loading });

  fetchAndSetData = params => {
    const pageSize = getTablePageSizeFromLocalStorage(tableUniqueKey);
    const { match } = this.props;

    const query = getQuery(match);
    const _params = { size: pageSize, ...query, ...params };

    this.setState({ loading: true });
    const location = getLocation(match);
    location.query = { ...location.query, ...params };
    setLocation(this.props, () => location.query);
    queryProcess(_params)
      .then(res => {
        const response = _.get(res, 'data');
        const { data, count } = response || {};

        this.setState({
          data,
          pagination: {
            total: count,
            current: _params && _params.page,
            pageSize: _params && _params.size,
          },
          total: count,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderFilter = () => {
    return <Filter fetchData={this.fetchAndSetData} />;
  };

  renderOperation = () => {
    return (
      <div style={{ borderTop: `1px solid ${border}`, padding: 20, display: 'flex' }}>
        <LinkToCreateProcess />
        <ImportProcess />
        <Link
          icon="eye"
          style={{ lineHeight: '30px', height: '28px', marginRight: 20 }}
          to={getProcessImportListPath()}
        >
          查看导入日志
        </Link>
      </div>
    );
  };

  renderTable = () => {
    const { data, total, pagination, loading } = this.state;

    return (
      <Table
        handleLoading={this.handleLoading}
        data={data}
        pagination={pagination}
        total={total}
        fetchData={this.fetchAndSetData}
        loading={loading}
        tableUniqueKey={tableUniqueKey}
      />
    );
  };

  render() {
    return (
      <div>
        {this.renderFilter()}
        {this.renderOperation()}
        {this.renderTable()}
      </div>
    );
  }
}

export default withRouter(List);
