import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import moment from 'src/utils/time';
import { replaceSign } from 'src/constants';
import log from 'src/utils/log';
import { black } from 'src/styles/color';
import { Row, Col, Spin } from 'src/components';
import { getSplitRecordDetail } from 'src/services/stock/splitRecord';

import Table from './tableForSplitDetail';

class Detail extends Component {
  state = {
    loading: false,
    detailData: null,
  };

  componentDidMount() {
    this.getSplitRecordDetailData();
  }

  getSplitRecordDetailData = async () => {
    const { match } = this.props;
    const id = _.get(match, 'params.id');
    if (!id) return;

    this.setState({ loading: true });
    try {
      const res = await getSplitRecordDetail({ id });
      const data = _.get(res, 'data.data');
      this.setState({ detailData: data });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading, detailData } = this.state;
    const {
      operateTime,
      targetMaterialLots,
      qrCode,
      amountBefore,
      amountAfter,
      operatorName,
      digitalSignatureUserName,
      specific,
      materialName,
      materialCode,
      warehouseName,
      storageName,
      firstStorageName,
      unit,
    } = detailData || {};
    const locationText =
      warehouseName && storageName && firstStorageName
        ? `${warehouseName}/${firstStorageName}/${storageName}`
        : replaceSign;
    const materialText = materialName && materialCode ? `${materialName}/${materialCode}` : replaceSign;
    const tableData =
      Array.isArray(targetMaterialLots) && targetMaterialLots.length
        ? targetMaterialLots.map(i => ({ ...i, unitName: unit }))
        : [];

    return (
      <Spin spinning={loading}>
        <div style={{ padding: 20 }}>
          <div style={{ color: black, fontSize: 16 }}>拆分记录详情</div>
          <Row>
            <Col type={'title'}>拆分位置</Col>
            <Col type={'content'}>{locationText}</Col>
          </Row>
          <Row>
            <Col type={'title'}>物料</Col>
            <Col type={'content'}>{materialText}</Col>
          </Row>
          <Row>
            <Col type={'title'}>规格描述</Col>
            <Col type={'content'}>{specific || replaceSign}</Col>
          </Row>
          <Row>
            <Col type={'title'}>拆分前二维码</Col>
            <Col type={'content'}>{qrCode || replaceSign}</Col>
          </Row>
          <Row>
            <Col type={'title'}>原数量</Col>
            <Col type={'content'}>{`${typeof amountBefore === 'number' ? amountBefore : replaceSign} ${unit ||
              replaceSign}`}</Col>
          </Row>
          <Row>
            <Col type={'title'}>拆分后数量</Col>
            <Col type={'content'}>{`${typeof amountAfter === 'number' ? amountAfter : replaceSign} ${unit ||
              replaceSign}`}</Col>
          </Row>
          <Row>
            <Col type={'title'}>操作人</Col>
            <Col type={'content'}>{operatorName || replaceSign}</Col>
          </Row>
          <Row>
            <Col type={'title'}>电子签名人</Col>
            <Col type={'content'}>{digitalSignatureUserName || replaceSign}</Col>
          </Row>
          <Row>
            <Col type={'title'}>操作时间</Col>
            <Col type={'content'}>{operateTime ? moment(operateTime).format('YYYY/MM/DD HH:mm') : replaceSign}</Col>
          </Row>
          <Row>
            <Col type={'title'}>拆分明细</Col>
            <Col type={'content'}>
              <Table tableData={tableData} />
            </Col>
          </Row>
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
