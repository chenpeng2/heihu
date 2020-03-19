import React, { Component } from 'react';
import { Table, OpenModal, Button, Attachment, Tooltip, FormattedMessage } from 'src/components';
import { blacklakeGreen, black, border, middleGrey } from 'src/styles/color/index';
import QcConfigDetailBase from 'src/containers/qcConfig/detail/base';
import styles from './qcModal.scss';

const { AntModal } = OpenModal;

type Props = {
  style: {},
  data: [],
  files: [],
};

class QcModal extends Component {
  props: Props;
  state = {
    visible: false,
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  closeModal = () => {
    this.setState({
      visible: false,
    });
  };

  handleOk = () => {
    this.setState({
      visible: false,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  renderFooter = () => {
    return (
      <Button style={{ display: 'block', margin: 'auto' }} type={'default'} onClick={this.closeModal}>
        关闭
      </Button>
    );
  };

  renderQcConfig = (data, index) => {
    return (
      <div
        style={{
          margin: 10,
          width: 920,
          border: '1px solid rgba(0, 20, 14, 0.1)',
          backgroundColor: '#fafafa',
          padding: 10,
          fontSize: 12,
        }}
      >
        <div className={styles.index}>{index + 1}</div>
        <QcConfigDetailBase qcConfig={data} />
      </div>
    );
  };

  renderQcConfigFiles = files => {
    if (!files) return null;
    return (
      <Attachment.InlineView titleStyle={{ width: 40 }} style={{ border: `1px dashed ${border}` }} files={files} />
    );
  };

  render() {
    const { visible } = this.state;
    const { style, data, files } = this.props;

    return (
      <div>
        <div
          style={{ color: blacklakeGreen, cursor: 'pointer' }}
          onClick={() => {
            this.showModal();
          }}
        >
          <FormattedMessage defaultMessage={'查看'} />
        </div>
        <AntModal
          style={{ ...style }}
          width={'1000px'}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          // title={'质检方案'}
          footer={null}
        >
          <div style={{ fontSize: 16, color: black }}>
            <FormattedMessage defaultMessage={'质检方案'} />
          </div>
          <div style={{ height: 500, overflowY: 'scroll' }}>
            {this.renderQcConfigFiles(files)}
            {Array.isArray(data) ? data.map((d, index) => this.renderQcConfig(d, index)) : null}
          </div>
          <div style={{ paddingTop: 10 }}>{this.renderFooter()}</div>
        </AntModal>
      </div>
    );
  }
}

export default QcModal;
