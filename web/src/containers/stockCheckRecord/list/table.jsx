import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Attachment, Tooltip, RestPagingTable, Badge } from 'src/components';
import { findStockCheckRecordStatus, getStockCheckResult } from 'src/containers/stockCheckRecord/utils';
import { replaceSign } from 'src/constants';
import { findQcStatus } from 'src/containers/storageAdjustRecord/util';
import moment from 'src/utils/time';
import InventoryButton from 'src/containers/stockCheckRecord/commonComponent/inventoryButton';
import { queryESignatureStatus } from 'services/knowledgeBase/eSignature';
import BatchEnsureNoDiff from './batchEnsureNoDiffData';
import LinkToExport from './export/linkToExport';

const MyBadge = Badge.MyBadge;
const IconViews = Attachment.IconViews;

class Table extends Component {
  state = {
    signStatus: false,
  };

  async componentWillMount() {
    const {
      data: { data: signStatus },
    } = await queryESignatureStatus('material_lot_trallying');
    this.setState({ signStatus });
  }

  getColumns = () => {
    const tooltipStyle = { display: 'block' };
    const { signStatus } = this.state;
    const { changeChineseToLocale } = this.context;

    const allColumns = [
      {
        title: '状态',
        dataIndex: 'status',
        showAlways: true,
        render: data => {
          const { name } = findStockCheckRecordStatus(data) || {};

          return <span>{name ? changeChineseToLocale(name) : replaceSign}</span>;
        },
      },
      {
        title: '二维码',
        dataIndex: 'qrcode',
        showAlways: true,
        render: data => {
          return <Tooltip text={data || replaceSign} length={10} style={tooltipStyle} />;
        },
      },
      {
        title: '物料',
        key: 'material',
        showAlways: true,
        render: (__, record) => {
          const { materialCode, materialName } = record || {};
          return (
            <div>
              <Tooltip text={materialCode || replaceSign} length={10} containerStyle={tooltipStyle} />
              <Tooltip text={materialName || replaceSign} length={10} containerStyle={tooltipStyle} />
            </div>
          );
        },
      },
      {
        title: '规格',
        dataIndex: 'specific',
        useColumnConfig: true,
        render: data => {
          return <Tooltip text={data || replaceSign} length={10} />;
        },
      },
      signStatus && {
        title: '电子签名人',
        dataIndex: 'digitalSignatureUserName',
        width: 100,
        showAlways: true,
        key: 'digitalSignatureUserName',
        render: digitalSignatureUserName => digitalSignatureUserName || replaceSign,
      },
      {
        title: '仓库',
        dataIndex: 'warehouse',
        showAlways: true,
        render: data => {
          const { name, code } = data || {};

          return (
            <div>
              <Tooltip text={name || replaceSign} length={10} containerStyle={tooltipStyle} />
              <Tooltip text={code || replaceSign} length={10} containerStyle={tooltipStyle} />
            </div>
          );
        },
      },
      {
        title: '一级仓位',
        dataIndex: 'firstStorage',
        showAlways: true,
        render: data => {
          const { name, code } = data || {};

          return (
            <div>
              <Tooltip text={name || replaceSign} length={10} containerStyle={tooltipStyle} />
              <Tooltip text={code || replaceSign} length={10} containerStyle={tooltipStyle} />
            </div>
          );
        },
      },
      {
        title: '二级仓位',
        dataIndex: 'secondStorage',
        showAlways: true,
        render: data => {
          const { name, code } = data || {};

          return (
            <div>
              <Tooltip text={name || replaceSign} length={10} containerStyle={tooltipStyle} />
              <Tooltip text={code || replaceSign} length={10} containerStyle={tooltipStyle} />
            </div>
          );
        },
      },
      {
        title: '质量状态',
        dataIndex: 'qcStatus',
        showAlways: true,
        render: data => {
          const value = findQcStatus(data) || {};
          const { name, color } = value || {};

          return <MyBadge text={name} color={color} />;
        },
      },
      {
        title: '父级二维码',
        dataIndex: 'parentQrCode',
        useColumnConfig: true,
        render: data => {
          return <Tooltip text={data || replaceSign} length={10} />;
        },
      },
      {
        title: '供应商编号/名称',
        dataIndex: 'supplierInfo',
        useColumnConfig: true,
        render: data => {
          const { code, name } = data || {};

          return (
            <div>
              <Tooltip text={name || replaceSign} length={10} containerStyle={tooltipStyle} />
              <Tooltip text={code || replaceSign} length={10} containerStyle={tooltipStyle} />
            </div>
          );
        },
      },
      {
        title: '供应商批次',
        dataIndex: 'mfgBatches',
        useColumnConfig: true,
        render: data => {
          const mfgBatchNos = [];
          if (Array.isArray(data)) {
            data.forEach(({ mfgBatchNo }) => mfgBatchNos.push(mfgBatchNo));
          }

          return (
            <Tooltip
              text={Array.isArray(mfgBatchNos) && mfgBatchNos.length ? mfgBatchNos.join(',') : replaceSign}
              length={10}
            />
          );
        },
      },
      {
        title: '入厂批次',
        useColumnConfiuseColumnConfigg: true,
        dataIndex: 'inventoryCode',
        render: data => {
          return <Tooltip text={data || replaceSign} length={10} />;
        },
      },
      {
        title: '销售订单',
        useColumnConfig: true,
        dataIndex: 'purchaseOrderCode',
        render: data => {
          return <Tooltip text={data || replaceSign} length={10} />;
        },
      },
      {
        title: '项目编号',
        useColumnConfig: true,
        dataIndex: 'projectCode',
        render: data => {
          return <Tooltip text={data || replaceSign} length={10} />;
        },
      },
      {
        title: '创建时间',
        useColumnConfig: true,
        dataIndex: 'createdAt',
        render: data => {
          const time = data ? moment(data).format('YYYY/MM/DD HH:mm') : replaceSign;

          return <div>{time}</div>;
        },
      },
      {
        title: '盘点执行人',
        dataIndex: 'operatorName',
        showAlways: true,
        render: data => {
          return <div>{data || replaceSign}</div>;
        },
      },
      {
        title: '盘点时间',
        dataIndex: 'trallyingAt',
        showAlways: true,
        render: data => {
          const time = data ? moment(data).format('YYYY/MM/DD HH:mm') : replaceSign;

          return <div>{time}</div>;
        },
      },
      {
        title: '备注',
        dataIndex: 'remark',
        showAlways: true,
        render: data => {
          return <Tooltip text={data || replaceSign} length={100} />;
        },
      },
      {
        title: '附件',
        dataIndex: 'attachmentIds',
        showAlways: true,
        render: data => {
          return (
            <div>
              <IconViews fileIds={data} />
            </div>
          );
        },
      },
      {
        title: '原数量',
        width: 170,
        fixed: 'right',
        showAlways: true,
        dataIndex: 'amountBefore',
        render: (data, record) => {
          const { unit } = record || {};
          return <div>{`${data || replaceSign} ${unit || replaceSign}`}</div>;
        },
      },
      {
        title: '盘点数量',
        width: 170,
        fixed: 'right',
        showAlways: true,
        dataIndex: 'amountAfter',
        render: (data, record) => {
          const { unit } = record || {};
          return <div>{`${data || replaceSign} ${unit || replaceSign}`}</div>;
        },
      },
      {
        title: '盘点结果',
        width: 170,
        fixed: 'right',
        key: 'result',
        showAlways: true,
        render: (__, record) => {
          const { amountBefore, amountAfter, unit } = record || {};
          const res = getStockCheckResult(amountAfter, amountBefore);

          if (res === replaceSign) return <span>{res}</span>;
          return <div>{`${changeChineseToLocale(res)} ${unit || replaceSign}`}</div>;
        },
      },
      {
        title: '操作',
        width: 80,
        showAlways: true,
        fixed: 'right',
        render: (__, record) => {
          // 当状态是已经盘点过的时候按钮disabled
          // 如果原数量和盘点数量不一致那么显示过账按钮。如果一致那么显示确认按钮。

          const { refetch } = this.props;
          return <InventoryButton refetch={refetch} data={record} />;
        },
      },
    ];

    return allColumns;
  };

  renderHeader = () => {
    const { refetch } = this.props;
    return (
      <div>
        <LinkToExport />
        <BatchEnsureNoDiff refetch={refetch} />
      </div>
    );
  };

  render() {
    const { data, refetch, total } = this.props;
    const columns = this.getColumns();

    return (
      <div style={{ margin: '0px 20px 0px' }}>
        <div style={{ marginTop: 10 }}>{this.renderHeader()}</div>
        <RestPagingTable
          columnsConfigLocalStorageKey={'stockCheckRecordColumnConfig'}
          useColumnConfig
          showTotalAmount
          style={{ margin: '20px 0 0' }}
          scroll={{ x: 2700 }}
          columns={_.compact(columns)}
          dataSource={data}
          refetch={refetch}
          total={total}
        />
      </div>
    );
  }
}

Table.propTypes = {
  style: PropTypes.object,
  data: PropTypes.any,
  refetch: PropTypes.any,
  total: PropTypes.number,
};

Table.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(Table);
