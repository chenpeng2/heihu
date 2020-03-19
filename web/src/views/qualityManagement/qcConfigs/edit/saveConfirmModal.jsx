import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropType from 'prop-types';

import { OpenModal, Button, Icon, Table, Tooltip } from 'src/components';
import Spin from 'components/spin';
import { primary, error } from 'src/styles/color/index';
import { replaceSign } from 'src/constants';
import { syncQcConfig } from 'src/services/qcConfig';

import styles from './styles.scss';
import { toQcConfigDetail } from '../../navigation';

const { AntModal } = OpenModal;

type Props = {
  style: {},
  visible: boolean,
  successMessage: string,
  listData: [],
  match: {},
  confirmType: string,
  errorMessage: string,
  onVisibleChange: () => {},
};

class SaveConfirmModal extends Component {
  props: Props;
  state = {
    visible: false,
    loading: false,
  };

  componentWillMount() {
    const { visible } = this.props;
    this.setState({
      visible,
    });
  }

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
    const { router } = this.context;
    const { match } = this.props;

    const id = _.get(match, 'params.id');

    return (
      <div style={{ padding: '24px 0 6px', display: 'flex', justifyContent: 'center' }}>
        <Button
          style={{ width: 114, marginRight: 60 }}
          type={'default'}
          onClick={() => {
            this.closeModal();
            router.history.push(toQcConfigDetail(id));
          }}
        >
          暂不更新
        </Button>
        <Button
          style={{ width: 114 }}
          disaled={this.state.loading}
          onClick={async () => {
            this.setState({ loading: true });
            await syncQcConfig({ id }).finally(() => {
              this.setState({ loading: false });
            });
            this.closeModal();
            router.history.push(toQcConfigDetail(id));
          }}
        >
          更新全部
        </Button>
      </div>
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
    const { visible, loading } = this.state;
    const { style } = this.props;

    return (
      <div>
        <AntModal
          className={styles.editProcessRoute}
          style={style}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
          width={420}
        >
          <Spin spinning={loading}>
            {this.renderConfirm('check-circle', primary, '编辑成功！', '是否需要同步更新所有用到的质检方案?')}
            {this.renderFooter()}
          </Spin>
        </AntModal>
      </div>
    );
  }
}

SaveConfirmModal.contextTypes = {
  router: PropType.func,
};

export default withRouter(SaveConfirmModal);
