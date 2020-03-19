import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin, Row, Col, FormattedMessage } from 'src/components';
import { getProductBatchCodeDetail } from 'src/services/productBatchCodeRule';
import { replaceSign } from 'src/constants';
import { black } from 'src/styles/color';
import LinkToEdit from 'src/containers/productBatchCodeRule/base/linkToEditProductBatchCodeRule';
import LinkHistory from 'src/containers/productBatchCodeRule/base/linkToProductBatchCodeRuleOperationHistory';
import ChangeStatus from 'src/containers/productBatchCodeRule/base/changeStatus';
import RuleDetailTable from 'src/containers/productBatchCodeRule/detail/ruleDetailTable';

import { findProductBatchCodeRuleType, findProductBatchCodeRuleStatus } from 'src/containers/productBatchCodeRule/util';

const pageStyle = {
  padding: 20,
};

class ProductBatchCodeDetail extends Component {
  state = {
    loading: false,
    detailData: null,
  };

  componentDidMount() {
    this.fetchAndSetData();
  }

  fetchAndSetData = async () => {
    const { match } = this.props;
    const ruleId = _.get(match, 'params.code');

    this.setState({ loading: true });

    const detailRes = await getProductBatchCodeDetail(ruleId).finally(() => {
      this.setState({ loading: false });
    });
    const detailData = _.get(detailRes, 'data.data');

    this.setState({
      detailData,
    });
  };

  renderHeader = () => {
    const { ruleName, ruleId, status } = _.get(this.state, 'detailData') || {};

    return (
      <div>
        <div style={{ display: 'inline-block', color: black, fontSize: '16px' }}>{ruleName || replaceSign}</div>
        <div style={{ display: 'inline-bloc', float: 'right' }}>
          <LinkToEdit iconType={'edit'} statusNow={status} code={ruleId} />
          <LinkHistory iconType={'bars'} code={ruleId} />
        </div>
      </div>
    );
  };

  renderContent = () => {
    const { ruleType, status, ruleId, description, items } = this.state.detailData || {};

    const { name: ruleTypeName } = findProductBatchCodeRuleType(ruleType) || {};
    const { name: statusName } = findProductBatchCodeRuleStatus(status) || {};

    return (
      <div>
        <Row>
          <Col type={'title'}>规则类型</Col>
          <Col type={'content'}>{ruleTypeName || replaceSign}</Col>
        </Row>
        <Row>
          <Col type={'title'}>状态</Col>
          <Col type={'content'}>
            <FormattedMessage style={{ marginRight: 10 }} defaultMessage={statusName} />
            <ChangeStatus code={ruleId} statusNow={status} cbForChangeStatus={this.fetchAndSetData} />
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>描述</Col>
          <Col type={'content'}>{description || replaceSign}</Col>
        </Row>
        <Row>
          <Col type={'title'}>规则明细</Col>
          <Col type={'content'} style={{ width: 800 }}>
            <RuleDetailTable tableData={items} />
          </Col>
        </Row>
      </div>
    );
  };

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <div style={pageStyle}>
          {this.renderHeader()}
          {this.renderContent()}
        </div>
      </Spin>
    );
  }
}

ProductBatchCodeDetail.PropTypes = {
  style: PropTypes.object,
  match: PropTypes.object,
};

export default ProductBatchCodeDetail;
