import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Tooltip, RestPagingTable, Link } from 'src/components';
import { replaceSign } from 'src/constants';
import { round } from 'src/utils/number';
import moment from 'src/utils/time';
import DataExport from './dataExport';
import { goToSplitRecordDetailPage } from '../utils';

type Props = {
  searchParams: {},
};

class Table extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    const { router } = this.context;

    return [
      {
        title: '拆分位置',
        key: 'location',
        render: (__, record) => {
          const { storageCode, storageName } = record || {};
          const text = `${storageCode || replaceSign}/${storageName || replaceSign}`;
          return <Tooltip text={text} length={15} />;
        },
      },
      {
        title: '物料',
        key: 'material',
        render: (__, record) => {
          const { materialCode, materialName } = record || {};
          const text = `${materialCode || replaceSign}/${materialName || replaceSign}`;
          return <Tooltip text={text} length={15} />;
        },
      },
      {
        title: '规格描述',
        dataIndex: 'specific',
        render: data => {
          return <Tooltip text={data || replaceSign} length={15} />;
        },
      },
      {
        title: '拆分前二维码',
        dataIndex: 'qrCode',
        render: data => {
          return <Tooltip text={data || replaceSign} length={15} />;
        },
      },
      {
        title: '原数量',
        dataIndex: 'amountBefore',
        render: (data, record) => {
          const { unit } = record || {};
          const text = `${typeof data === 'number' ? round(data) : replaceSign}  ${unit || replaceSign}`;
          return <span>{text}</span>;
        },
      },
      {
        title: '拆分后数量',
        dataIndex: 'amountAfter',
        render: (data, record) => {
          const { unit } = record || {};
          const text = `${typeof data === 'number' ? round(data) : replaceSign}  ${unit || replaceSign}`;
          return <span>{text}</span>;
        },
      },
      {
        title: '操作人',
        dataIndex: 'operatorName',
        render: data => {
          return <span>{data || replaceSign}</span>;
        },
      },
      {
        title: '电子签名人',
        dataIndex: 'digitalSignatureUserName',
        render: data => {
          return <span>{data || replaceSign}</span>;
        },
      },
      {
        title: '操作时间',
        dataIndex: 'operateTime',
        render: data => {
          const text = data ? moment(data).format('YYYY/MM/DD HH:mm') : replaceSign;

          return <span>{text}</span>;
        },
      },
      {
        title: '操作',
        render: (__, record) => {
          const { id } = record || {};
          return (
            <div>
              <Link onClick={() => goToSplitRecordDetailPage(router, id)}>查看</Link>
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { tableData, dataTotalAmount, refetch } = this.props;

    return (
      <div>
        <DataExport style={{ margin: 20 }} dataTotalAmount={dataTotalAmount} />
        <RestPagingTable
          refetch={refetch}
          total={dataTotalAmount || 0}
          columns={this.getColumns()}
          dataSource={tableData || []}
        />
      </div>
    );
  }
}

Table.propTypes = {
  style: PropTypes.object,
  tableData: PropTypes.any,
  dataTotalAmount: PropTypes.number,
  refetch: PropTypes.func,
};

Table.contextTypes = {
  router: PropTypes.any,
};

export default Table;
