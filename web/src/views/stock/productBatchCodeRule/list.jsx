import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin } from 'src/components';
import Table from 'src/containers/productBatchCodeRule/list/table';
import Filter from 'src/containers/productBatchCodeRule/list/filter';
import CreateButton from 'src/containers/productBatchCodeRule/base/linkToCreateProductBatchCodeRule';
import { getProductBatchCodeRules } from 'src/services/productBatchCodeRule';
import { getLocation, getQuery } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { border } from 'src/styles/color';

import { LIST_DEFAULT_SIZE } from 'src/containers/productBatchCodeRule/util';

class List extends Component {
  state = {
    productBatchCodeRules: [],
    totalAmountOfProductBatchCodeRules: 0,
    loading: false,
  };

  componentDidMount() {
    this.fetchAndSetData();
  }

  fetchAndSetData = async params => {
    // 处理参数
    const { match } = this.props;
    const query = getQuery(match);
    const _params = { ...query, ...params, size: LIST_DEFAULT_SIZE };
    // 将参数设置到url中
    const location = getLocation(match);
    location.query = _params;
    setLocation(this.props, () => location.query);
    // open loading
    this.setState({ loading: true });

    // 拉取成品批号规则列表数据
    const productBatchCodeRulesRes = await getProductBatchCodeRules(_params).finally(() => {
      // close loading
      this.setState({ loading: false });
    });
    const { data, total } = _.get(productBatchCodeRulesRes, 'data') || {};

    // 设置state
    this.setState(
      {
        productBatchCodeRules: data,
        totalAmountOfProductBatchCodeRules: total,
      },
    );
  };

  renderTable = () => {
    const { productBatchCodeRules, totalAmountOfProductBatchCodeRules } = this.state;

    return (
      <Table
        fetchData={this.fetchAndSetData}
        data={productBatchCodeRules}
        totalAmount={totalAmountOfProductBatchCodeRules}
      />
    );
  };

  renderFilter = () => {
    return <Filter fetchData={this.fetchAndSetData} />;
  };

  renderCreateButton = () => {
    return <CreateButton />;
  };

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <div>{this.renderFilter()}</div>
        <div style={{ borderTop: `1px solid ${border}` }}>{this.renderCreateButton()}</div>
        <div>{this.renderTable()}</div>
      </Spin>
    );
  }
}

List.propType = {
  style: PropTypes.object,
  match: PropTypes.object,
};

export default List;
