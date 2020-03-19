import React, { Component } from 'react';
import _ from 'lodash';
import { SimpleTable, Tooltip, Spin } from 'src/components';
import { getInboundOrderDetail } from 'src/services/stock/inboundOrder';
import { replaceSign } from 'src/constants';
import log from 'src/utils/log';
import { fontSub } from 'src/styles/color';
import styles from './styles.scss';

type Props = {
  inboundOrderCode: string,
};

class DetailModal extends Component {
  props: Props;
  state = {
    data: null,
    loading: false,
  };

  async componentWillMount() {
    const { inboundOrderCode } = this.props;
    this.setState({ loading: true });
    try {
      const res = await getInboundOrderDetail({ inboundOrderCode });
      this.setState({ data: _.get(res, 'data.data.materialList'), loading: false });
    } catch (e) {
      log.error(e);
      this.setState({ loading: false });
    }
  }

  getColumns = () => {
    return [
      {
        title: '行序列',
        width: 60,
        dataIndex: 'lineNo',
        render: lineNo => lineNo || replaceSign,
      },
      {
        title: '物料编号/名称',
        width: 160,
        dataIndex: 'material',
        render: material => {
          const { code, name } = material;
          return <Tooltip width={140} text={`${code || replaceSign}/${name || replaceSign}`} />;
        },
      },
      {
        title: '入库进度',
        width: 160,
        dataIndex: 'amountPlanned',
        render: (amountPlanned, record) => {
          const { amountInFactory, unitName, amountReturn } = record;
          return `${amountInFactory - amountReturn}/${amountPlanned} ${unitName || replaceSign}`;
        },
      },
      {
        title: '入库位置',
        dataIndex: 'storage',
        render: (storage, record) => {
          const { warehouse, firstStorage } = record;
          const data = storage || firstStorage || warehouse;
          if (!data) return replaceSign;
          const { name, code } = data;
          return <Tooltip width={140} text={`${code || replaceSign}/${name || replaceSign}`} />;
        },
      },
    ];
  };

  render() {
    const { data, loading } = this.state;
    const { inboundOrderCode } = this.props;
    const columns = this.getColumns();

    return (
      <Spin spinning={loading}>
        <div className={styles.inboundOrderDetailModal}>
          <div style={{ fontSize: 14, marginBottom: 20 }}>入库单号：{inboundOrderCode}</div>
          <SimpleTable
            columns={columns}
            dataSource={Array.isArray(data) ? data : []}
            tableStyle={{ width: 560 }}
            pagination={false}
            scroll={{ y: 260, x: true }}
          />
          <div style={{ color: fontSub, marginTop: 5 }}>入库进度 =（入库数 - 退库数）/ 计划数</div>
        </div>
      </Spin>
    );
  }
}

export default DetailModal;
