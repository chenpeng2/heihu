import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Modal } from 'components';
import WorkOrderList from 'src/views/cooperate/plannedTicket/list';
import { replaceSign } from 'src/constants';

import { toCreateQcPlan } from '../../navigation';

const AntModal = Modal.AntModal;

class CreateQcPlanModal extends Component {
  static propTypes = {
    checkType: PropTypes.object,
    colseModal: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  checkWorkOrder = () => {
    this.props.colseModal();
    const { checkType } = this.props;
    const workOrderCode = '0531jhgd001';
    this.props.history.push({ pathname: toCreateQcPlan(), state: { checkType, workOrderCode } });
  };

  render() {
    const { checkType, visible } = this.props;
    const { changeChineseToLocale } = this.context;
    const title = `${changeChineseToLocale('创建质检计划')}（${checkType ? checkType.display : replaceSign}）`;

    return (
      <AntModal width={1080} visible={visible} title={title} onOk={this.checkWorkOrder} onCancel={this.colseModal}>
        <WorkOrderList containerStyle={{ margin: '-20px 10px -20px -20px' }} />
      </AntModal>
    );
  }
}

CreateQcPlanModal.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default withRouter(CreateQcPlanModal);
