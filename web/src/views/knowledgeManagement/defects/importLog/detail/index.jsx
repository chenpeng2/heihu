import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin, Row, Col, FormattedMessage } from 'src/components';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';
import { importDefectDetail } from 'src/services/knowledgeBase/defect';
import useFetch from 'src/utils/hookUtils/fetchHooks';

import Table from './table';

const contentStyle = { width: 920 };
const titleStyle = { paddingLeft: 20 };

const Detail = props => {
  const { match } = props;
  const importId = _.get(match, 'params.id');

  const [{ data, isLoading }, setParams] = useFetch(params => importDefectDetail(importId, params));

  const { content, createdAt, userName, status, detailList } = _.get(data, 'data.data') || {};

  return (
    <Spin spinning={isLoading}>
      <p style={{ fontSize: 16, margin: 20 }}>
        <FormattedMessage defaultMessage={'导入日志详情'} />
      </p>
      <div style={{ marginBottom: 30 }}>
        <Row>
          <Col type="title" style={titleStyle}>
            导入时间
          </Col>
          <Col type="content" style={contentStyle}>
            {createdAt ? moment(createdAt).format('YYYY/MM/DD HH:mm:ss') : replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type="title" style={titleStyle}>
            导入用户
          </Col>
          <Col type="content" style={contentStyle}>
            {userName ? decodeURIComponent(userName) : replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type="title" style={titleStyle}>
            导入结果
          </Col>
          <Col type="content" style={contentStyle}>
            {status || replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type="title" style={titleStyle}>
            导入详情
          </Col>
          <Col type="content" style={contentStyle}>
            {content}
          </Col>
        </Row>
      </div>
      <Table tableData={detailList} />
    </Spin>
  );
};

Detail.propTypes = {
  style: PropTypes.any,
  match: PropTypes.any,
};

export default Detail;
