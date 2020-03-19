import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { border, warning } from 'src/styles/color';
import { Select, Spin } from 'src/components';
import { getReports } from 'src/services/stock/inventoryReport';
import log from 'src/utils/log';
import { getParams, setLocation } from 'src/utils/url';

import { COLLECT_WAY } from './utils';
import Filter, { formatFilterParams } from './filter';
import ExportData from './exportData';
import Table from './table';

const Option = Select.Option;

class MaterialCollectReport extends Component {
  state = {
    collectType: COLLECT_WAY.init.value,
    loading: false,
    data: null,
    pagination: { page: 1, size: 10, total: 0 },
  };

  fetchData = async params => {
    this.setState({ loading: true });
    // filter是Filter组件中的参数, rest目前包含table中的参数
    const { filter, ...rest } = params || {};
    const { queryObj } = getParams();
    const { filter: lastFilter, ...lastRest } = queryObj || {};

    const nextFilter = { ...lastFilter, ...filter };
    const nextParams = { size: 10, page: 1, ...lastRest, ...formatFilterParams(nextFilter) || {}, ...rest };

    setLocation(this.props, { filter: nextFilter, ...lastRest, ...rest });

    try {
      const res = await getReports(nextParams);
      const { data, total } = _.get(res, 'data') || {};
      this.setState({
        data,
        total,
        pagination: { current: nextParams.page || 1, pageSize: nextParams.size || 10, total: total || 0 },
      });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading, data, pagination } = this.state;
    const { changeChineseToLocale } = this.context;

    return (
      <Spin spinning={loading}>
        <Filter refetch={this.fetchData} />
        <div style={{ borderTop: `1px solid ${border}` }} />
        <div style={{ margin: '20px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          {/* <ExportData /> */}
          <Select
            onChange={v => { this.setState({ collectType: v }); }}
            style={{ width: 200 }}
            value={this.state.collectType}
          >
            {Object.values(COLLECT_WAY)
              .map(i => {
                const { name, value } = i || {};
                if (!value || !name) return null;
                return <Option value={value}>{changeChineseToLocale(name)}</Option>;
              })
              .filter(i => i)}
          </Select>
        </div>
        <Table
          pagination={pagination}
          refetch={this.fetchData}
          total={pagination ? pagination.total : 0}
          tableData={data}
          collectType={this.state.collectType}
          style={{ marginTop: 20 }}
        />
      </Spin>
    );
  }
}

MaterialCollectReport.propTypes = {
  style: PropTypes.object,
};

MaterialCollectReport.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default MaterialCollectReport;
