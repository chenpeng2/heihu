import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { border } from 'src/styles/color';
import { Spin } from 'src/components';
import { setLocation, getParams } from 'src/utils/url';
import { getInStorageRecords } from 'src/services/inventory';
import { queryESignatureStatus } from 'services/knowledgeBase/eSignature';
import log from 'src/utils/log';

import Filter, { formatFilterData } from './filter';
import Table from './table';
import DataExport from './dataExport';

class InStorageList extends Component {
  state = {
    loading: false,
    data: [],
    total: 0,
    nextPage: 1,
  };

  async componentWillMount() {
    const {
      data: { data: inStorageSignStatus },
    } = await queryESignatureStatus('material_lot_in_storage');
    const {
      data: { data: transferSignStatus },
    } = await queryESignatureStatus('material_lot_transfer');
    const signStatus = inStorageSignStatus || transferSignStatus;
    this.setState({ signStatus });
  }

  fetchAndSetData = async (params, filterFormValue) => {
    this.setState({ loading: true });

    const { queryObj } = getParams();
    const { table2 } = queryObj || {};
    const { query: lastQuery, filter: lastFilter } = table2 || {};

    let nextFilter = { ...lastFilter };
    if (filterFormValue) {
      nextFilter = { ...filterFormValue };
    }
    const filterValue = formatFilterData(nextFilter);

    let nextQuery = { size: 10, ...lastQuery, ...params };
    if (filterValue) {
      nextQuery = { size: 10, ...filterValue, ...params };
    }
    const nextPage = nextQuery ? nextQuery.page : 1;

    setLocation(this.props, query => {
      return { ...query, table2: { query: nextQuery, filter: nextFilter } };
    });

    try {
      const res = await getInStorageRecords(nextQuery);
      const { data, total } = _.get(res, 'data');
      this.setState({ data, total });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false, nextPage });
    }
  };

  renderFilter = () => {
    return <Filter fetchData={this.fetchAndSetData} />;
  };

  renderHeader = () => {
    const { total, signStatus } = this.state;
    return (
      <div style={{ overflow: 'hidden', marginBottom: 20 }}>
        <DataExport
          signStatus={signStatus}
          total={total}
          disabled={total <= 0}
          style={{ float: 'right', display: 'inline-block' }}
        />
      </div>
    );
  };

  renderTable = () => {
    const { data, total, nextPage, signStatus } = this.state;
    return (
      <Table signStatus={signStatus} data={data} currentPage={nextPage} total={total} refetch={this.fetchAndSetData} />
    );
  };

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <div>
          {this.renderFilter()}
          <div style={{ borderTop: `1px solid ${border}` }} />
          <div style={{ margin: 20 }}>
            {this.renderHeader()}
            {this.renderTable()}
          </div>
        </div>
      </Spin>
    );
  }
}

InStorageList.propTypes = {
  style: PropTypes.object,
};

export default withRouter(InStorageList);
