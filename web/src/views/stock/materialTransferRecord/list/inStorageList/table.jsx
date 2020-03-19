import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link, Badge, Tooltip, RestPagingTable } from 'src/components';
import { replaceSign } from 'src/constants';
import { findInStorageTypes } from 'src/containers/materialTransferRecord/util';
import { findQcStatus } from 'src/containers/storageAdjustRecord/util';
import moment from 'src/utils/time';
import { isOrganizationUseQrCode } from 'src/utils/organizationConfig';

const MyBadge = Badge.MyBadge;

class Table extends Component {
  state = {};

  getColumns = () => {
    const { signStatus } = this.props;
    const useQrCode = isOrganizationUseQrCode();
    return [
      {
        title: '入库类型',
        width: 80,
        dataIndex: 'type',
        render: data => {
          const { name } = findInStorageTypes(data) || {};
          return name || replaceSign;
        },
      },
      {
        title: '移动事务记录',
        width: 120,
        dataIndex: 'transactionName',
        render: data => {
          return <Tooltip text={data || replaceSign} width={100} />;
        },
      },
      useQrCode
        ? {
            title: '二维码',
            width: 120,
            dataIndex: 'qrcode',
            render: (data, record) => {
              const { materialLotId } = record || {};
              const text = data || replaceSign;
              return <Link to={`/stock/materialTransferRecordList/${materialLotId}/qrCodeDetail`}>{text}</Link>;
            },
          }
        : null,
      useQrCode
        ? {
            title: '嵌套二维码',
            width: 120,
            dataIndex: 'containerQrcode',
            render: data => {
              const text = data || replaceSign;
              return <Tooltip text={text} length={120} />;
            },
          }
        : null,
      {
        title: '入库仓位',
        width: 150,
        key: 'inStorage',
        render: (__, record) => {
          const { storageName, storageCode } = record || {};
          return (
            <div>
              <div>
                <Tooltip text={storageCode || replaceSign} width={150} />
              </div>
              <div>
                <Tooltip text={storageName || replaceSign} width={150} />
              </div>
            </div>
          );
        },
      },
      {
        title: '出库仓位',
        width: 150,
        key: 'inStorage',
        render: (__, record) => {
          const { outStorageName, outStorageCode } = record || {};
          return (
            <div>
              <div>
                <Tooltip text={outStorageCode || replaceSign} width={150} />
              </div>
              <div>
                <Tooltip text={outStorageName || replaceSign} width={150} />
              </div>
            </div>
          );
        },
      },
      {
        title: '物料编号/名称',
        width: 150,
        key: 'material',
        render: (__, record) => {
          const { materialCode, materialName } = record || {};
          return (
            <div>
              <div>
                <Tooltip text={materialCode || replaceSign} width={150} />
              </div>
              <div>
                <Tooltip text={materialName || replaceSign} width={150} />
              </div>
            </div>
          );
        },
      },
      {
        title: '出库数量',
        width: 100,
        dataIndex: 'amount',
        render: (data, record) => {
          const { unit } = record || {};
          const text = `${data || replaceSign} ${unit || replaceSign}`;
          return <Tooltip text={text} width={100} />;
        },
      },
      {
        title: '质量状态',
        width: 80,
        dataIndex: 'qcStatus',
        render: data => {
          const { name, color } = findQcStatus(data) || {};

          return <MyBadge text={name || replaceSign} color={color} />;
        },
      },
      {
        title: '操作人',
        width: 80,
        dataIndex: 'operatorName',
        render: data => {
          return <Tooltip text={data || replaceSign} length={80} />;
        },
      },
      signStatus && {
        title: '电子签名人',
        width: 80,
        dataIndex: 'digitalSignatureUserName',
        render: data => {
          return <Tooltip text={data || replaceSign} length={80} />;
        },
      },
      {
        title: '操作时间',
        width: 120,
        dataIndex: 'createdAt',
        render: data => {
          return <Tooltip text={data ? moment(data).format('YYYY/MM/DD HH:mm') : replaceSign} width={120} />;
        },
      },
      {
        title: '备注',
        width: 120,
        dataIndex: 'msg',
        render: data => {
          return <Tooltip text={data || replaceSign} width={120} />;
        },
      },
    ].filter(i => i);
  };

  handleTableChange = pagination => {
    const { refetch } = this.props;

    refetch(pagination ? { page: pagination.current } : {});
  };

  render() {
    const { data, total, currentPage, ...rest } = this.props;

    return (
      <div>
        <RestPagingTable
          style={{ margin: 0 }}
          columns={this.getColumns()}
          scroll={{ x: true }}
          dataSource={data || []}
          onChange={this.handleTableChange}
          pagination={{
            current: currentPage || 1,
            total,
          }}
          {...rest}
        />
      </div>
    );
  }
}

Table.propTypes = {
  style: PropTypes.object,
  data: PropTypes.any,
  total: PropTypes.any,
  currentPage: PropTypes.any,
  refetch: PropTypes.func,
};

export default Table;
