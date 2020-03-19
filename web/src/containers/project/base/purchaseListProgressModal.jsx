import React, { Component } from 'react';
import Proptypes from 'prop-types';
import { Table, Modal, Tooltip } from 'src/components';
import { replaceSign } from 'src/constants';
import { black } from 'src/styles/color';
import { thousandBitSeparator } from 'utils/number';
import { formatUnix } from 'utils/time';

const AntModal = Modal.AntModal;

type Props = {
  style: {},
  data: any,
  visible: boolean,
  onVisibleChange: () => {},
};

class PurchaseListProgressModal extends Component {
  props: Props;
  state = {
    visible: false,
  };

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps;

    this.setState({
      visible,
    });
  }

  getColumns = () => {
    return [
      {
        title: '编号/名称',
        dataIndex: 'material',
        width: 200,
        render: data => {
          const { code, name } = data;
          return code && name ? <Tooltip text={`${code}/${name}`} length={25} /> : replaceSign;
        },
      },
      {
        title: '总需求量',
        width: 100,
        render: (_, record) => {
          const { material, amountProjectTotal } = record || {};
          const { unit } = material;

          return typeof amountProjectTotal === 'number' ? (
            <Tooltip text={`${thousandBitSeparator(amountProjectTotal)} ${unit || replaceSign}`} length={10} />
          ) : (
            replaceSign
          );
        },
      },
      {
        title: '采购中',
        width: 100,
        render: (data, record) => {
          const { amountApplied, material } = record || {};
          const { unit } = material;

          return typeof amountApplied === 'number' ? (
            <Tooltip text={`${thousandBitSeparator(amountApplied)} ${unit || replaceSign}`} length={10} />
          ) : (
            replaceSign
          );
        },
      },
      {
        title: '已采购',
        width: 100,
        render: (data, record) => {
          const { material, amountFinished } = record || {};
          const { unit } = material;

          return typeof amountFinished === 'number' ? (
            <Tooltip text={`${thousandBitSeparator(amountFinished)} ${unit || replaceSign}`} length={10} />
          ) : (
            replaceSign
          );
        },
      },
    ];
  };

  closeModal = () => {
    const { onVisibleChange } = this.props;

    this.setState({
      visible: false,
    });

    onVisibleChange(false);
  };

  openModal = () => {
    const { onVisibleChange } = this.props;

    this.setState({
      visible: true,
    });

    onVisibleChange(true);
  };

  renderTable = () => {
    const { data } = this.props;
    const columns = this.getColumns();

    return (
      <Table
        style={{ margin: 0 }}
        columns={columns}
        dataSource={data ? data.data : []}
        pagination={false}
        scroll={{ y: 260 }}
      />
    );
  };

  render() {
    const { visible } = this.state;
    const { changeChineseToLocale } = this.context;

    return (
      <AntModal
        width={800}
        footer={null}
        visible={visible}
        title={<span style={{ fontSize: 16, color: black }}>{changeChineseToLocale('采购进度')}</span>}
        onCancel={this.closeModal}
      >
        {this.renderTable()}
      </AntModal>
    );
  }
}

PurchaseListProgressModal.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default PurchaseListProgressModal;
