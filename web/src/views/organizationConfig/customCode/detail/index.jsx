import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { Spin, Row, Col } from 'src/components';
import { replaceSign } from 'src/constants';
import { black } from 'src/styles/color';
import { getCustomCodeDetail } from 'src/services/systemConfig/customCode';
import log from 'src/utils/log';

import LinkToEdit from '../baseComponent/linkToEditPage';
import RuleDetailTable from './ruleDetailTable';
import { getValidDateText, DEFAULT_USE_RANGE, CODE_TYPE } from '../utils';

class Detail extends Component {
  state = {
    id: null,
    loading: false,
    detailData: null,
  };

  componentWillMount() {
    const { match } = this.props;
    const id = _.get(match, 'params.id');
    this.setState({ id });
  }

  componentDidMount() {
    this.fetchAndSetDetailData();
  }

  fetchAndSetDetailData = async () => {
    const { id } = this.state;
    if (!id) return;

    try {
      this.setState({ loading: true });
      const res = await getCustomCodeDetail({ id });
      const data = _.get(res, 'data.data');
      this.setState({ detailData: data });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading, id, detailData } = this.state;
    const { name, validDateFrom, validDateTo, items, des } = detailData || {};

    return (
      <Spin spinning={loading}>
        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: black, fontSize: 16 }}>自定义编码详情</span>
            <LinkToEdit withIcon id={id} />
          </div>
          <div>
            <Row>
              <Col type={'title'}>编码类型</Col>
              <Col type={'content'}>{CODE_TYPE.name}</Col>
            </Row>
            <Row>
              <Col type={'title'}>编码名称</Col>
              <Col type={'content'}>{name || replaceSign}</Col>
            </Row>
            <Row>
              <Col type={'title'}>适用范围</Col>
              <Col type={'content'}>{DEFAULT_USE_RANGE.name}</Col>
            </Row>
            <Row>
              <Col type={'title'}>有效时间</Col>
              <Col type={'content'}>{getValidDateText(validDateFrom, validDateTo)}</Col>
            </Row>
            <Row>
              <Col type={'title'}>编码规则明细</Col>
              <Col type={'content'}>
                <RuleDetailTable tableData={items} />
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>编码规则描述</Col>
              <Col type={'content'}>{des}</Col>
            </Row>
          </div>
        </div>
      </Spin>
    );
  }
}

Detail.propTypes = {
  style: PropTypes.object,
  match: PropTypes.any,
};

export default withRouter(Detail);
