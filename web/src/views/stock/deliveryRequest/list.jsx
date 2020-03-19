import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin, message } from 'src/components';
import { border } from 'src/styles/color';
import log from 'src/utils/log';
import { getSearchInLocation, setSearchAndFilterParamsInUrl } from 'src/routes/getRouteParams';

import Filter from 'src/containers/deliveryRequest/list/filter';
import LinkToCreatePage from 'src/containers/deliveryRequest/baseComponent/linkToCreatePage';
import { getDeliveryRequests } from 'src/services/stock/deliveryRequest';
import Table from 'src/containers/deliveryRequest/list/table';

class List extends Component {
  state = {
    loading: false,
    data: [],
    total: 0,
  };

  fetchAndSetData = async (params, originalParams) => {
    // 将参数设置到url中
    const { query } = getSearchInLocation();
    const _params = { ...query, ...params, size: 10 }; // url中需要有输入框参数和查询参数

    if (!_params.storageIds) {
      message.warn('请维护用户工作部门以获取数据查询权限');
      return;
    }

    _params.storageIds = `${_params.storageIds}`;

    this.setState({ loading: true });
    try {
      const res = await getDeliveryRequests(_params);
      setSearchAndFilterParamsInUrl(_params, originalParams);
      const { data, total } = _.get(res, 'data');
      this.setState({ data, total });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  renderFilter = () => {
    return <Filter fetchData={this.fetchAndSetData} />;
  };

  renderCreateButton = () => {
    return <LinkToCreatePage style={{ marginTop: 20 }} />;
  };

  renderTable = () => {
    const { data, total } = this.state;
    return <Table style={{ marginTop: 20 }} data={data} total={total} refetch={this.fetchAndSetData} />;
  };

  render() {
    const { loading, style } = this.state;
    return (
      <Spin spinning={loading}>
        <div style={style}>
          {this.renderFilter()}
          <div style={{ borderTop: `1px solid ${border}`, padding: '0px 20px' }}>
            {this.renderCreateButton()}
            {this.renderTable()}
          </div>
        </div>
      </Spin>
    );
  }
}

List.propTypes = {
  style: PropTypes.object,
};


export default List;
