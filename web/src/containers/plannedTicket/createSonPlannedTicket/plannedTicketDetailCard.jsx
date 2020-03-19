import React, { Component } from 'react';
import _ from 'lodash';
import { Modal } from 'antd';

import { replaceSign } from 'src/constants';
import { border, black, primary } from 'src/styles/color';
import { Row, Col, Link } from 'src/components';
import { toWorkOrderDetail } from 'src/views/cooperate/plannedTicket/navigation';
import { getPurchaseOrderDetail } from 'src/services/cooperate/purchaseOrder';
import moment from 'src/utils/time';

import CraftTable from './craftTable';
import { findPlannedTicketTypes, getCraftType } from '../util';

type Props = {
  fatherProjectDetail: any,
  style: any,
};

class PlannedTicketDetailCard extends Component {
  props: Props;
  state = {
    purchaseOrder: {},
    visible: false,
  };

  componentDidMount() {
    this.setPurchaseOrderData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setPurchaseOrderData(nextProps);
  }

  setPurchaseOrderData = props => {
    const purchaseOrderCode = _.get(props, 'fatherProjectDetail.purchaseOrderCode');

    if (purchaseOrderCode) {
      getPurchaseOrderDetail(purchaseOrderCode).then(res => {
        this.setState({
          purchaseOrder: _.get(res, 'data.data') || {},
        });
      });
    }
  };

  render() {
    const { fatherProjectDetail, style } = this.props;
    const { changeChineseToLocale } = this.context;
    const { amount, materialCode, materialName, materialUnit, code, processRouteCode, mbomVersion, type } =
      fatherProjectDetail || {};
    const { purchaseOrder } = this.state;
    // 计划工单类型
    const projectType = findPlannedTicketTypes(type) ? findPlannedTicketTypes(type).name : replaceSign;

    // 销售订单
    // const purchaseOrderTargetDate = _.get(purchaseOrder, 'targetDate');
    const purchaseOrderText = `${_.get(purchaseOrder, 'purchaseOrderCode') || replaceSign}`;
    // （订单交期：${
    //   purchaseOrderTargetDate ? moment(purchaseOrderTargetDate).format('YYYY/MM/DD') : replaceSign
    // }）

    // 计划工单号
    const productText = `${materialCode || replaceSign}/${materialName || replaceSign} ${amount || 0} ${materialUnit ||
      replaceSign}`;

    // 工艺
    const craftText = getCraftType(fatherProjectDetail);

    return (
      <div style={{ borderBottom: `1px solid ${border}`, ...style }}>
        <div style={{ color: black, fontSize: '16px', margin: '10px 20px' }}>
          {changeChineseToLocale('父计划工单信息')}
        </div>
        <Row>
          <Col type={'title'}>计划工单类型</Col>
          <Col type={'content'}>{projectType}</Col>
          <Col type={'title'}>销售订单</Col>
          <Col type={'content'}>{purchaseOrderText}</Col>
        </Row>
        <Row>
          <Col type={'title'}>计划工单编号</Col>
          <Col type={'content'}>
            {code ? (
              <Link onClick={() => window.open(`${toWorkOrderDetail({ code })}`, '_blank')}>{code}</Link>
            ) : (
              replaceSign
            )}
          </Col>
          <Col type={'title'}>产出物料</Col>
          <Col type={'content'}>{productText}</Col>
        </Row>
        <Row>
          <Col type={'title'}>工艺</Col>
          <Col type={'content'}>
            <span> {craftText} </span>
            <span
              style={{ color: primary, cursor: 'pointer', marginLeft: 10 }}
              onClick={() => {
                this.setState({ visible: true });
                // openModal({
                //   title: '工序',
                //   width: 660,
                //   footer: null,
                //   children: (
                //     <PlannedTicketDetailCard style={{ display: 'none' }}>
                //       <CraftTable
                //         mBomInfo={{ mBomVersion: mbomVersion, productCode: materialCode }}
                //         processRoutingInfo={{ code: processRouteCode }}
                //       />
                //     </PlannedTicketDetailCard>
                //   ),
                // });
              }}
            >
              {changeChineseToLocale('预览')}
            </span>
          </Col>
        </Row>
        <Modal
          title="工序"
          visible={this.state.visible}
          footer={null}
          onCancel={() => this.setState({ visible: false })}
          width="660px"
        >
          <CraftTable
            mBomInfo={{ mBomVersion: mbomVersion, productCode: materialCode }}
            processRoutingInfo={{ code: processRouteCode }}
          />
        </Modal>
      </div>
    );
  }
}

PlannedTicketDetailCard.contextTypes = {
  changeChineseToLocale: () => {},
};

export default PlannedTicketDetailCard;
