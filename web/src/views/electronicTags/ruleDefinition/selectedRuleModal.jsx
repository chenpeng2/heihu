import React, { Component } from 'react';
import _ from 'lodash';

import { OpenModal, Button, Icon, Table, Tooltip } from 'src/components';
import { warning } from 'src/styles/color/index';
import { replaceSign } from 'src/constants';

const { AntModal } = OpenModal;

type Props = {
  visible: boolean,
  onVisibleChange: () => {},
  data: [],
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

  getColumns = () => {
    return [{
      title: '规则名称',
      width: 100,
      dataIndex: 'ruleName',
    }, {
      title: '默认规则',
      width: 80,
      dataIndex: 'asDefault',
      render: text => text ? '是' : '否',
    }, {
      title: '状态',
      width: 80,
      dataIndex: 'status',
      render: status => status === 1 ? '启用中' : '停用中',
    }, {
      title: '规则描述',
      width: 100,
      dataIndex: 'description',
      render: text => text ? <Tooltip text={text} length={23} /> : replaceSign,
    }];
  }

  renderTable = () => {
    const { data } = this.props;
    const columns = this.getColumns();
    return (
      <div>
        <div style={{ margin: '30px 0 20px', display: 'flex', alignItems: 'center' }}>
          <Icon type={'exclamation-circle'} style={{ fontSize: 32, color: warning, marginRight: 14 }} />
          <div style={{ fontSize: 16 }}>已选择的规则</div>
        </div>
        <div style={{ marginBottom: 60 }}>
          <Table columns={columns} dataSource={data} pagination={{ size: 10, total: data.length }} scroll={{ y: 180 }} />
        </div>
      </div>
    );
  };

  render() {
    const { visible } = this.state;
    return (
      <AntModal
        visible={visible}
        onCancel={this.handleCancel}
        footer={null}
        width={450}
      >
        {this.renderTable()}
      </AntModal>
    );
  }
}

export default LeaveConfirmModal;
