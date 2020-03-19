import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { TASK_DISPATCH_TYPE } from 'utils/organizationConfig';
import { Button, Dropdown, Menu, Icon } from 'components';

import CreateQcPlanModal from './CreateQcPlanModal';
import { QCPLAN_CHECK_TYPE } from '../../constants';
import { toCreateQcPlan } from '../../navigation';
import { getOrganizationTaskDispatchType } from '../utils';
import styles from '../styles.scss';

class ActionForList extends Component {
  static propTypes = {
    history: PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state = {
      createModalVisible: false,
      checkType: {},
    };
  }

  handleMenuClick = e => {
    const checkTypeDisplay = e.key;
    const checkType = _.findKey(QCPLAN_CHECK_TYPE, o => o === checkTypeDisplay);
    const _checkType = { value: checkType, display: checkTypeDisplay };
    this.setState({ checkType: _checkType }, () => {
      this.props.history.push({ pathname: toCreateQcPlan(), state: { checkType: _checkType } });
    });
  };

  showCreateQcPlanModal = () => {
    this.setState({ createModalVisible: true });
  };

  closeCreateQcPlanModal = () => {
    this.setState({ createModalVisible: false });
  };

  renderCreateAction = () => {
    const { createModalVisible, checkType } = this.state;
    const { changeChineseToLocale } = this.context;

    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="生产检">{changeChineseToLocale('创建生产检计划')}</Menu.Item>
        <Menu.Item key="首检">{changeChineseToLocale('创建首检计划')}</Menu.Item>
      </Menu>
    );

    return (
      <React.Fragment>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button icon="plus-circle-o" className={styles.qcPlan_button}>
            {changeChineseToLocale('创建质检计划')} <Icon type="down" />
          </Button>
        </Dropdown>
        <CreateQcPlanModal
          colseModal={this.closeCreateQcPlanModal}
          visible={createModalVisible}
          checkType={checkType}
        />
      </React.Fragment>
    );
  };

  render() {
    const dispatchType = getOrganizationTaskDispatchType();

    return (
      <div className={styles.qcPlan_action_for_list}>
        {dispatchType === TASK_DISPATCH_TYPE.manager ? this.renderCreateAction() : null}
      </div>
    );
  }
}

ActionForList.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default withRouter(ActionForList);
