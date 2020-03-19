import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropType from 'prop-types';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { OpenModal, Button, Icon } from 'src/components';
import { warning } from 'src/styles/color/index';

const { AntModal } = OpenModal;

type Props = {
  visible: boolean,
  intl: any,
  onVisibleChange: () => {},
  nextRoute: {},
  onConfirm: () => {},
};

class LeaveConfirmModal extends Component {
  props: Props;
  state = {
    visible: false,
  };

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps;
    if (visible !== this.state.visible) {
      this.setState({ visible });
    }
  }

  closeModal = () => {
    this.setState(
      {
        visible: false,
      },
      () => {
        this.props.onVisibleChange(false);
      },
    );
  };

  handleOk = () => {
    this.closeModal();
  };

  handleCancel = () => {
    this.closeModal();
  };

  renderFooter = () => {
    const { nextRoute, onConfirm, intl } = this.props;
    return (
      <div style={{ padding: '24px 0 6px', display: 'flex', justifyContent: 'center' }}>
        <Button
          style={{ width: 114, marginRight: 60 }}
          type={'default'}
          onClick={() => {
            this.closeModal();
          }}
        >
          取消
        </Button>
        <Button
          style={{ width: 114 }}
          onClick={() => {
            onConfirm();
            this.closeModal();
            setTimeout(() => {
              this.context.router.history.push(nextRoute.pathname);
            }, 100);
          }}
        >
          确定
        </Button>
      </div>
    );
  };

  renderConfirm = () => {
    const { intl } = this.props;
    return (
      <div style={{ margin: '35px 0 36px 0', display: 'flex' }}>
        <div style={{ display: 'inline-block', marginRight: 14, marginTop: 10 }}>
          <Icon type={'exclamation-circle'} style={{ fontSize: 36, color: warning }} />
        </div>
        <div style={{ display: 'inline-block' }}>
          <div style={{ fontSize: 18 }}>{changeChineseToLocale('确定离开当前页面？', intl)}</div>
          <div>{changeChineseToLocale('离开后，当前未保存的变更将丢失且无法恢复', intl)}</div>
        </div>
      </div>
    );
  };

  render() {
    const { visible } = this.state;
    return (
      <div>
        <AntModal visible={visible} onOk={this.handleOk} onCancel={this.handleCancel} footer={null} width={420}>
          {this.renderConfirm()}
          {this.renderFooter()}
        </AntModal>
      </div>
    );
  }
}

LeaveConfirmModal.contextTypes = {
  router: PropType.func,
};

export default withRouter(injectIntl(LeaveConfirmModal));
