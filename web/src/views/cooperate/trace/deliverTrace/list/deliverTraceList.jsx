import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'utils/time';
import { Link, Table, Tooltip, Spin } from 'src/components';
import { replaceSign, MaxQRCodeLength, MaxMfgBatchLength } from 'src/constants';
import { thousandBitSeparator } from 'utils/number';

type Props = {
  viewer: any,
  refetch: () => {},
  data: [],
  allFields: [],
  loading: boolean,
  pagination: {},
};

class DeliverTraceList extends Component {
  props: Props;

  getShowField = (allFields, field) => {
    const filterFieldsArr = allFields.filter(n => n.name === field);
    if (filterFieldsArr.length > 0) {
      return filterFieldsArr[0].is_show;
    }
    return false;
  };

  getMfgBatchesStr = mfgBatches => {
    return mfgBatches.join('; ');
  };

  handleTableChange = pagination => {
    this.props.refetch({
      page: pagination && pagination.current,
      size: (pagination && pagination.pageSize) || 10,
    });
  };

  getColumns = allFields => {
    const { router } = this.context;
    const columns = [
      this.getShowField(allFields, 'material_code') && {
        title: '物料',
        dataIndex: 'material_code',
        width: 200,
        render: (_, record) => {
          return (
            <div>
              <Link
                key={`material-${record.id}`}
                onClick={() => {
                  router.history.push(`/bom/materials/${encodeURIComponent(record.material_code)}/detail`);
                }}
              >
                <Tooltip text={record.material_code || replaceSign} length={23} />
                <br />
                <Tooltip text={record.material_name || replaceSign} length={23} />
              </Link>
            </div>
          );
        },
      },
      {
        title: '数量',
        dataIndex: 'amount',
        width: 200,
        render: (amount, record) => {
          return `${thousandBitSeparator(amount)} ${record.unit}`;
        },
      },
      this.getShowField(allFields, 'order_code') && {
        title: '订单号',
        dataIndex: 'order_code',
        width: 100,
        render: (_, record) => (record.order_code ? record.order_code : replaceSign),
      },
      this.getShowField(allFields, 'project_code') && {
        title: '项目号',
        width: 100,
        dataIndex: 'project_code',
        render: (_, record) => record.project_code || replaceSign,
      },
      this.getShowField(allFields, 'out_time') && {
        title: '出厂时间',
        dataIndex: 'out_time',
        width: 200,
        render: (_, record) => {
          const getFormatDate = timestamp => {
            if (!timestamp) {
              return '';
            }
            return moment(Number(timestamp)).format('YYYY/MM/DD HH:mm');
          };
          return getFormatDate(record.out_time);
        },
      },
      this.getShowField(allFields, 'mfg_batches') && {
        title: '供应商批次号',
        dataIndex: 'mfg_batches',
        width: 100,
        render: (_, record) => {
          return record.mfg_batches && record.mfg_batches.length > 0
            ? this.getMfgBatchesStr(record.mfg_batches)
            : replaceSign;
        },
      },
      this.getShowField(allFields, 'qr_code') && {
        title: '二维码',
        dataIndex: 'qr_code',
        width: 200,
        render: (_, record) => {
          return (
            <Tooltip
              key={`qrCode-${record.id}`}
              text={record.qr_code || replaceSign}
              length={MaxQRCodeLength}
              onLink={() => {
                router.history.push(`/cooperate/deliverTrace/${record.material_lot_id}/qrCodeDetail`);
              }}
            />
          );
        },
      },
    ];
    return columns;
  };

  render() {
    const { data, loading, allFields, pagination } = this.props;
    if (!allFields || !data) {
      return null;
    }
    const columns = this.getColumns(allFields);

    return (
      <Spin spinning={loading}>
        <div id="lgDeliver_list" key={'deliver'} style={{ marginTop: 68 }}>
          <Table
            tableUniqueKey={'DeliverTraceListTableConfig'}
            useColumnConfig
            bordered
            dragable
            dataSource={data.hits}
            total={data.total}
            rowKey={record => record.id}
            columns={columns}
            pagination={pagination}
            onChange={this.handleTableChange}
          />
        </div>
      </Spin>
    );
  }
}

DeliverTraceList.contextTypes = {
  router: PropTypes.object.isRequired,
  relay: PropTypes.object,
};

export default withRouter(DeliverTraceList);
