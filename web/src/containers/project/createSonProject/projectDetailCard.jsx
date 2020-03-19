import React, { Component } from 'react';
import _ from 'lodash';
import { Modal } from 'antd';

import { primary, border, black } from 'src/styles/color';
import { Row, Col, openModal } from 'src/components';
import { replaceSign } from 'src/constants';
import { PROJECT_TYPES } from 'src/containers/project/constant';
import moment from 'src/utils/time';

import CraftTable from './craftTable';
import { getCraftType } from '../utils';

type Props = {
  style: {},
  fatherProjectDetail: any,
};

class ProjectDetailCard extends Component {
  props: Props;
  state = {
    visible: false,
  };

  render() {
    const { fatherProjectDetail } = this.props;
    const { amountProductPlanned, product, purchaseOrder, projectCode, processRouting, mbomVersion, type } =
      fatherProjectDetail || {};

    // 项目类型
    let projectType = replaceSign;
    if (type === 1) {
      projectType = PROJECT_TYPES.storage.name;
    }
    if (type === 2) {
      projectType = PROJECT_TYPES.purchaseOrderType.name;
    }

    // 销售订单
    // const purchaseOrderTargetDate = _.get(purchaseOrder, 'targetDate');
    const purchaseOrderText = `${_.get(purchaseOrder, 'purchaseOrderNumber') || replaceSign}`;
    // （订单交期：${
    //   purchaseOrderTargetDate ? moment(purchaseOrderTargetDate).format('YYYY/MM/DD') : replaceSign
    // }）

    // 产出物料
    const productText = `${_.get(product, 'code') || replaceSign}/${_.get(product, 'name') ||
      replaceSign} ${amountProductPlanned || 0} ${_.get(product, 'unit') || replaceSign}`;

    // 工艺
    const craftText = getCraftType(fatherProjectDetail);

    return (
      <div style={{ borderBottom: `1px solid ${border}` }}>
        <div style={{ color: black, fontSize: '16px', margin: '10px 20px' }}>父项目信息</div>
        <Row>
          <Col type={'title'}>项目类型</Col>
          <Col type={'content'}>{projectType}</Col>
          <Col type={'title'}>销售订单</Col>
          <Col type={'content'}>{purchaseOrderText}</Col>
        </Row>
        <Row>
          <Col type={'title'}>项目编号</Col>
          <Col type={'content'}>{projectCode || replaceSign}</Col>
          <Col type={'title'}>产出物料</Col>
          <Col type={'content'}>{productText}</Col>
        </Row>
        <Row>
          <Col type={'title'}>工艺</Col>
          <Col type={'content'} style={{ width: 500 }}>
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
                //     <CraftTable
                //       mBomInfo={{ mBomVersion: mbomVersion, productCode: _.get(product, 'code') }}
                //       processRoutingInfo={{ code: _.get(processRouting, 'code') }}
                //     />
                //   ),
                // });
              }}
            >
              预览
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
            mBomInfo={{ mBomVersion: mbomVersion, productCode: _.get(product, 'code') }}
            processRoutingInfo={{ code: _.get(processRouting, 'code') }}
          />
        </Modal>
      </div>
    );
  }
}

export default ProjectDetailCard;
