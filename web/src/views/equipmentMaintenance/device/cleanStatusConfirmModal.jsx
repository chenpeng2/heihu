import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropType from 'prop-types';

import { OpenModal, Button, Icon, Table, Tooltip } from 'src/components';
import { primary, error, warning } from 'src/styles/color/index';
import { replaceSign } from 'src/constants';

import styles from './index.scss';

const { AntModal } = OpenModal;

type Props = {
  cleanStatus: number,
  visible: boolean,
  onVisibleChange: () => {},
  onConfirm: () => {},
};

class CleanStatusConfirmModal extends Component {
  props: Props;
  state = {
    visible: false,
  };

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

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps;
    if (visible !== this.state.visible) {
      this.setState({ visible });
    }
  }

  handleOk = () => {
    this.closeModal();
  };

  handleCancel = () => {
    this.closeModal();
  };

  renderFooter = hasMBomsChanged => {
    const { cleanStatus, onConfirm } = this.props;
    return (
      <div style={{ padding: '24px 0 6px', display: 'flex', justifyContent: 'center' }}>
        <Button
          style={{ width: 114, marginRight: 60 }}
          type={'default'}
          onClick={() => {
            this.closeModal();
          }}
        >
          放弃
        </Button>
        <Button
          style={{ width: 114 }}
          onClick={() => {
            onConfirm(cleanStatus);
            this.closeModal();
          }}
        >
          确定
        </Button>
      </div>
    );
  };

  renderConfirm = () => {
    const { cleanStatus } = this.props;
    return (
      <div style={{ margin: '35px 0 36px 0', display: 'flex' }}>
        <div style={{ display: 'inline-block', marginRight: 14, marginTop: 10 }}>
          <Icon type={'exclamation-circle'} style={{ fontSize: 36, color: warning }} />
        </div>
        <div style={{ display: 'inline-block' }}>
          <div style={{ fontSize: 18 }}>{'变更设备清洁状态'}</div>
          <div>将标记该设备为{<span style={{ color: cleanStatus === 2 ? primary : error }}>{cleanStatus === 2 ? '已清洁' : '待清洁'}</span>}，请确认现场状况符合该状态，变更后，清洁效期将重新开始计算</div>
        </div>
      </div>
    );
  };

  render() {
    const { visible } = this.state;

    return (
      <div>
        <AntModal
          className={styles.editProcessRoute}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
          width={420}
        >
          {this.renderConfirm()}
          {this.renderFooter()}
        </AntModal>
      </div>
    );
  }
}

CleanStatusConfirmModal.contextTypes = {
  router: PropType.func,
};

export default withRouter(CleanStatusConfirmModal);
