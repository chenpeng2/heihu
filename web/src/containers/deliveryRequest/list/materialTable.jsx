import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Badge, Tooltip, RestPagingTable, Spin } from 'src/components';
import { getDeliveryRequestDetail } from 'src/services/stock/deliveryRequest';
import log from 'src/utils/log';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';
import { black } from 'src/styles/color';

import LinkToEditPage from '../baseComponent/linkToEditPage';
import { transformAmount, findDeliveryRequestMaterialType, DELIVERY_REQUEST_STATUS } from '../util';

class MaterialTable extends Component {
  state = {
    data: [],
    total: 0,
    loading: false,
  };

  componentDidMount() {
    const { code } = this.props;
    if (!code) return;
    this.fetchAndSetData({ code });
  }

  fetchAndSetData = async params => {
    this.setState({ loading: true });
    try {
      const { code } = params;
      if (!code) return;
      const res = await getDeliveryRequestDetail(code);
      const { items } = _.get(res, 'data.data');
      this.setState({ data: items });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  getColumns = () => {
    return [
      {
        title: '编号',
        dataIndex: 'requestItem.lineId',
        intlId: 'key3005',
        render: data => {
          return <span>{typeof data === 'number' ? data : replaceSign}</span>;
        },
      },
      {
        title: '物料编号/名称',
        key: 'requestItem.material',
        intlId: 'key1802',
        render: (__, record) => {
          const { materialCode, materialName } = record ? record.requestItem : {};
          if (materialCode && materialName) {
            return (
              <div>
                <div>
                  <Tooltip text={materialCode} length={10} />
                </div>
                <div>
                  <Tooltip text={materialName} length={10} />
                </div>
              </div>
            );
          }

          return <span>{replaceSign}</span>;
        },
      },
      {
        title: '执行进度',
        key: 'requestItem.progress',
        intlId: 'key2636',
        render: (__, record) => {
          const { amountPlan, amountDone, materialUnit } = record ? record.requestItem : {};
          if (typeof amountPlan === 'number' && typeof amountDone === 'number') {
            return <div>{`${amountDone}/${amountPlan} ${materialUnit || replaceSign}`}</div>;
          }

          return <span>{replaceSign}</span>;
        },
      },
      {
        title: '可用库存',
        dataIndex: 'requestItem.availableAmount',
        intlId: 'key3173',
        render: (data, record) => {
          const { materialInfo, requestItem } = record;
          const { unitId, materialUnit } = requestItem;

          const res = transformAmount({ material: materialInfo, amount: data }, unitId, data);

          if (typeof res === 'number') {
            return <span>{`${res} ${materialUnit || replaceSign}`}</span>;
          }

          return <span>{replaceSign}</span>;
        },
      },
      {
        title: '生产批次',
        dataIndex: 'requestItem.productionBatch',
        render: data => data || replaceSign,
      },
      {
        title: '状态',
        dataIndex: 'requestItem.status',
        intlId: 'key2946',
        render: data => {
          const { name, color } = findDeliveryRequestMaterialType(data) || {};
          if (!name) return <span>{replaceSign}</span>;
          return <Badge.MyBadge color={color} text={name} />;
        },
      },
      {
        title: '销售订单',
        dataIndex: 'requestItem.purchaseOrderCode',
        intlId: 'key828',
        render: data => {
          return <Tooltip text={data || replaceSign} length={15} />;
        },
      },
      {
        title: '客户',
        dataIndex: 'requestItem.customerName',
        intlId: 'key781',
        render: data => {
          return <Tooltip text={data || replaceSign} length={15} />;
        },
      },
      {
        title: '交货日期',
        dataIndex: 'requestItem.deliveryTime',
        intlId: 'key393',
        render: data => {
          if (!data) return <span>{replaceSign}</span>;
          const _data = moment(data).format('YYYY/MM/DD');
          return <Tooltip text={_data} length={15} />;
        },
      },
      {
        title: '备注',
        dataIndex: 'requestItem.remark',
        intlId: 'key1079',
        render: data => {
          return <Tooltip text={data || replaceSign} length={15} />;
        },
      },
    ];
  };

  render() {
    const columns = this.getColumns();
    const { loading, data } = this.state;
    const { title, code, deliveryRequestDetail } = this.props;
    const { status } = deliveryRequestDetail || {};

    return (
      <Spin spinning={loading}>
        <div style={{ margin: '10px 20px', width: 1000, paddingBottom: 35 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ fontSize: '16px', color: black }}>{title || replaceSign}</div>
            <div>{status === DELIVERY_REQUEST_STATUS.create.value ? <LinkToEditPage id={code} /> : null}</div>
          </div>
          <div>
            <RestPagingTable
              scroll={{ y: 300 }}
              style={{ margin: 0 }}
              columns={columns}
              dataSource={data}
              pagination={false}
            />
          </div>
        </div>
      </Spin>
    );
  }
}

MaterialTable.propTypes = {
  style: PropTypes.object,
  code: PropTypes.string,
  title: PropTypes.string,
  deliveryRequestDetail: PropTypes.any,
};

export default MaterialTable;
