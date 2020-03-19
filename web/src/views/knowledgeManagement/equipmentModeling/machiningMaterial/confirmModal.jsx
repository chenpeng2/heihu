import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { OpenModal, Button, Icon } from 'src/components';
import { warning } from 'src/styles/color/index';

const customLanguage = getCustomLanguage();
const { AntModal } = OpenModal;

type Props = {
  visible: boolean,
  type: string,
  action: string,
  onVisibleChange: () => {},
  onConfirm: () => {},
};

class ConfirmModal extends Component {
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
    const { onConfirm } = this.props;
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
          }}
        >
          确定
        </Button>
      </div>
    );
  };

  renderConfirm = () => {
    const { type, action } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    return (
      <div style={{ margin: '35px 0 36px 0', display: 'flex' }}>
        <div style={{ display: 'inline-block', marginRight: 14 }}>
          <Icon type={'exclamation-circle'} style={{ fontSize: 36, color: warning }} />
        </div>
        <div>
          {changeChineseTemplateToLocale(
            '该{machiningMaterial}启用后，类型、编码、单位、{type}生命周期管理及电子标签管理不可更改，确定{action}吗？',
            {
              machiningMaterial: customLanguage.equipment_machining_material,
              type: `${`${type}` === '2' ? changeChineseToLocaleWithoutIntl('工装类型、') : ''}`,
              action: `${
                action === 'create'
                  ? changeChineseToLocaleWithoutIntl('创建')
                  : changeChineseToLocaleWithoutIntl('编辑')
              }`,
            },
          )}
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

ConfirmModal.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withRouter(ConfirmModal);
