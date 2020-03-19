import React, { Component } from 'react';
import PropType from 'prop-types';
import { OpenModal, Button, Icon } from 'components';
import { primary, error } from 'src/styles/color/index';

const { AntModal } = OpenModal;

type Props = {
  style: {},
  confirmType: string,
  visible: boolean,
  errorMessage: string,
  processRoutingCode: string,
  onVisibleChange: () => {},
};

class SaveConfirmModal extends Component {
  props: Props;
  state = {
    visible: false,
  };

  componentWillMount() {
    const { visible } = this.props;
    this.setState({
      visible,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps;
    this.setState({
      visible,
    });
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
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

  renderFooter = () => {
    const { router } = this.context;
    const { confirmType, processRoutingCode } = this.props;

    return (
      <Button
        style={{ display: 'block', margin: 'auto', marginBottom: 6 }}
        type={'default'}
        onClick={() => {
          this.closeModal();
          if (confirmType === 'success' && processRoutingCode) {
            router.history.push(`/bom/processRoute/${processRoutingCode}/detail`);
          }
        }}
      >
        知道了
      </Button>
    );
  };

  renderConfirm = (iconType, iconColor, title, text) => {
    return (
      <div style={{ margin: '35px 0 36px 0' }}>
        <div style={{ display: 'inline-block', marginRight: 14 }}>
          <Icon type={iconType} style={{ fontSize: 36, color: iconColor }} />
        </div>
        <div style={{ display: 'inline-block' }}>
          <div style={{ fontSize: 18 }}>{title}</div>
          <div>{text}</div>
        </div>
      </div>
    );
  };

  render() {
    const { visible } = this.state;
    const { style, confirmType, errorMessage } = this.props;
    if (confirmType === 'success') {
      return null;
    }
    return (
      <div>
        <AntModal
          style={style}
          visible={visible}
          onOk={this.closeModal}
          onCancel={this.closeModal}
          footer={null}
          width={420}
        >
          {confirmType && this.renderConfirm('close-circle', error, '保存失败！', errorMessage || '失败原因不明')}
          {this.renderFooter()}
        </AntModal>
      </div>
    );
  }
}

SaveConfirmModal.contextTypes = {
  router: PropType.func,
};

export default SaveConfirmModal;
