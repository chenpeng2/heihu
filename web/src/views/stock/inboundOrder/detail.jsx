import React, { Component } from 'react';
import _ from 'lodash';
import { FormattedMessage, SimpleTable, FormItem, Tooltip, Spin } from 'src/components';
import { getInboundOrderDetail } from 'src/services/stock/inboundOrder';
import moment from 'src/utils/time';
import log from 'src/utils/log';
import { replaceSign } from 'src/constants';
import { getValidityPeriodPrecision } from 'src/utils/organizationConfig';

import styles from './styles.scss';

type Props = {
  match: any,
  inboundOrderCode: string,
};

class Detail extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
  };

  async componentDidMount() {
    const { match } = this.props;
    const inboundOrderCode = _.get(match, 'location.query.inboundOrderCode');
    this.setState({ loading: true });
    try {
      const res = await getInboundOrderDetail({ inboundOrderCode });
      this.setState({ data: _.get(res, 'data.data'), loading: false });
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
        title: '物料',
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
          const { amountInFactory, amountReturn, unitName } = record;
          if (typeof amountInFactory !== 'number' || typeof amountReturn !== 'number') return replaceSign;
          return `${amountInFactory - amountReturn}/${amountPlanned} ${unitName || replaceSign}`;
        },
      },
      {
        title: '计划数',
        dataIndex: 'amountPlanned',
        key: 'amountPlanned',
        width: 100,
        render: (amountPlanned, record) => {
          const { unitName } = record;
          return typeof amountPlanned === 'number' ? `${amountPlanned} ${unitName}` : replaceSign;
        },
      },
      {
        title: '入库数',
        dataIndex: 'amountInFactory',
        key: 'amountInFactory',
        width: 100,
        render: (amountInFactory, record) => {
          const { unitName } = record;
          return typeof amountInFactory === 'number' ? `${amountInFactory} ${unitName}` : replaceSign;
        },
      },
      {
        title: '退库数',
        dataIndex: 'amountReturn',
        key: 'amountReturn',
        width: 100,
        render: (amountReturn, record) => {
          const { unitName } = record;
          return typeof amountReturn === 'number' ? `${amountReturn} ${unitName}` : replaceSign;
        },
      },
      {
        title: '入库位置',
        width: 200,
        dataIndex: 'storage',
        render: (storage, record) => {
          const { warehouse, firstStorage } = record;
          const data = storage || firstStorage || warehouse;
          if (!data) return replaceSign;
          const { name, code } = data;
          return <Tooltip width={140} text={`${code || replaceSign}/${name || replaceSign}`} />;
        },
      },
      {
        title: '供应商',
        width: 140,
        dataIndex: 'supplier',
        key: 'supplier',
        render: supplier => (supplier && supplier.name) || replaceSign,
      },
      {
        title: '供应商批次',
        width: 200,
        dataIndex: 'batchNo',
        key: 'batchNo',
        render: batchNo => batchNo || replaceSign,
      },
      {
        title: '入厂规格',
        dataIndex: 'specification',
        key: 'specification',
        width: 180,
        render: specification => {
          if (!specification) return replaceSign;
          const { numerator, unitName } = specification;
          return `${numerator}${unitName}`;
        },
      },
      {
        title: '产地',
        key: 'originPlaceTxt',
        dataIndex: 'originPlaceTxt',
        width: 240,
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '入厂批次',
        dataIndex: 'inboundBatch',
        key: 'inboundBatch',
        width: 200,
        render: inboundBatch => inboundBatch || replaceSign,
      },
      {
        title: '生产日期',
        dataIndex: 'productionDate',
        key: 'productionDate',
        width: 120,
        render: productionDate => {
          const { showFormat } = getValidityPeriodPrecision();
          return (productionDate && moment(Number(productionDate)).format(showFormat)) || replaceSign;
        },
      },
      {
        title: '有效期',
        dataIndex: 'validPeriod',
        key: 'validPeriod',
        width: 120,
        render: validPeriod => {
          const { showFormat } = getValidityPeriodPrecision();
          return (validPeriod && moment(Number(validPeriod)).format(showFormat)) || replaceSign;
        },
      },
    ];
  };

  render() {
    const { data, loading } = this.state;
    const materialList = _.get(data, 'materialList', []);
    const { match } = this.props;
    const inboundOrderCode = _.get(match, 'location.query.inboundOrderCode');
    const columns = this.getColumns();

    return (
      <Spin spinning={loading}>
        <div className={styles.inboundOrderDetail}>
          <div style={{ margin: '20px 0 30px 20px' }}>
            <FormattedMessage
              style={{
                fontSize: 16,
                display: 'inline-block',
              }}
              defaultMessage={'入库单详情'}
            />
          </div>
          <FormItem label="入库单号">{inboundOrderCode}</FormItem>
          <FormItem label="物料列表">
            <SimpleTable
              columns={columns}
              dataSource={materialList}
              tableStyle={{ width: 900 }}
              pagination={false}
              scroll={{ y: 260, x: true }}
            />
          </FormItem>
          <FormItem label="备注">{(data && data.remark) || replaceSign}</FormItem>
        </div>
      </Spin>
    );
  }
}

export default Detail;
