import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'utils/time';
import { error, primary, border } from 'src/styles/color';
import { queryESignatureStatus } from 'services/knowledgeBase/eSignature';
import { RestPagingTable, Tooltip, Badge } from 'src/components';
import { replaceSign, MaxQRCodeLength } from 'src/constants';
import { thousandBitSeparator } from 'utils/number';

type Props = {
  refetch: () => {},
  handleSelect: () => {},
  getExportTitle: () => {},
  userQrCode: boolean,
  isSearch: boolean,
  signStatus: boolean,
  isBatchOperation: boolean,
  isAllChecked: boolean,
  data: {},
};
const MyBadge = Badge.MyBadge;

class Table extends Component {
  props: Props;
  state = {
    config: [],
    selectedRows: [],
  };

  async componentWillMount() {
    const { getExportTitle } = this.props;
    getExportTitle(this.getColumnsTitle());
  }

  componentWillReceiveProps(nextProps) {
    const { isAllChecked: prevIsAllChecked } = this.props;
    const { isBatchOperation, isSearch, isAllChecked } = nextProps;
    if (!isBatchOperation || isSearch || (!prevIsAllChecked && isAllChecked)) {
      this.setState({ selectedRows: [] });
    }
  }

  getColumnsTitle = () => {
    const title = [];
    this.getColumns()
      .filter(n => n)
      .forEach(n => {
        const index = n.title.indexOf('编号/');
        const amountIndex = n.title.indexOf('数量');
        if (index !== -1) {
          title.push(`${n.title.substring(0, index)}编号`);
          title.push(`${n.title.substring(0, index)}名称`);
        } else if (amountIndex !== -1) {
          title.push('数量');
          title.push('单位');
        } else {
          title.push(n.title);
        }
      });
    return title;
  };

  getColumns = () => {
    const { userQrCode, signStatus } = this.props;
    const { changeChineseToLocale } = this.context;

    const columns = [
      userQrCode
        ? {
            title: '二维码',
            type: 'QRCode',
            dataIndex: 'qrcode',
            fixed: 'left',
            render: (qrCode, record) => {
              return <Tooltip key={`qrCode-${record.id}`} text={qrCode || replaceSign} length={MaxQRCodeLength} />;
            },
          }
        : null,
      {
        title: '物料编号/名称',
        dataIndex: 'materialInfo',
        type: 'material',
        key: 'materialInfo',
        fixed: 'left',
        render: materialInfo => (
          <div>
            <Tooltip text={materialInfo.code || replaceSign} length={10} />
            <br />
            <Tooltip text={materialInfo.name || replaceSign} length={10} />
          </div>
        ),
      },
      userQrCode
        ? {
            title: '包装二维码',
            type: 'QRCode',
            dataIndex: 'containerQrcode',
            key: 'containerQrcode',
            width: 200,
            render: containerQrcode => containerQrcode || replaceSign,
          }
        : null,
      {
        title: '数量',
        type: 'amount',
        dataIndex: 'amount',
        key: 'amount',
        width: 200,
        render: (amount, record) => {
          return (
            <div key={`amount-${record.id}`}>
              {thousandBitSeparator(amount)} {record.materialInfo.unit || ''}
            </div>
          );
        },
      },
      {
        title: '重量',
        key: 'weight',
        width: 200,
        render: (__, record) => {
          const { amount, unit } = _.get(record, 'weighDetail') || {};
          return amount && unit ? `${amount} ${unit}` : replaceSign;
        },
      },
      {
        title: '等级',
        key: 'level',
        width: 200,
        render: (__, record) => {
          const { level } = _.get(record, 'weighDetail') || {};
          return level || replaceSign;
        },
      },
      {
        title: '项目编号',
        type: 'purchaseOrderNo',
        dataIndex: 'projectCode',
        width: 200,
        key: 'projectCode',
        render: projectCode => projectCode || replaceSign,
      },
      {
        title: '质量状态',
        width: 100,
        dataIndex: 'qcStatus',
        key: 'qcStatus',
        render: qcStatus => {
          let status = {};
          switch (qcStatus) {
            case 1:
              status = {
                color: primary,
                text: '合格',
              };
              break;
            case 2:
              status = {
                color: primary,
                text: '让步合格',
              };
              break;
            case 3:
              status = {
                color: border,
                text: '待检',
              };
              break;
            case 4:
              status = {
                color: error,
                text: '不合格',
              };
              break;
            default:
              status = {};
          }
          return <MyBadge text={status.text} color={status.color} />;
        },
      },
      {
        title: '出厂仓位',
        dataIndex: 'storage',
        width: 150,
        key: 'storage',
        render: storage => <Tooltip text={storage.name || replaceSign} width={150} />,
      },
      {
        title: '操作人',
        width: 80,
        dataIndex: 'operator',
        key: 'operator',
        render: (operator, record) => (
          <div key={`operatorName-${record.id}`}>
            <Tooltip text={operator.name || replaceSign} width={80} />
          </div>
        ),
      },
      {
        title: '出厂单据',
        width: 100,
        key: 'outBills',
        render: (__, record) => {
          //  销售订单编号或发运申请编号
          // orderNumber中后端决定了是哪一种，前端不需管理
          const { orderNumber } = record || {};

          return <Tooltip text={orderNumber || replaceSign} length={12} />;
        },
      },
      {
        title: '生产批次',
        width: 100,
        dataIndex: 'productBatch',
        render: data => {
          const text = data || replaceSign;
          return <Tooltip text={text} length={12} />;
        },
      },
      {
        title: '客户',
        width: 100,
        dataIndex: 'customerName',
        key: 'customerName',
        render: customerName => <Tooltip text={customerName || replaceSign} width={100} />,
      },
      signStatus && {
        title: '电子签名人',
        dataIndex: 'digitalSignatureUserName',
        width: 80,
        key: 'digitalSignatureUserName',
        render: digitalSignatureUserName => <Tooltip text={digitalSignatureUserName || replaceSign} width={80} />,
      },
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        type: 'date',
        key: 'createdAt',
        width: 200,
        render: (createdAt, record) => {
          const getFormatDate = timestamp => {
            if (!timestamp) {
              return '';
            }
            return moment(Number(timestamp)).format('YYYY/MM/DD HH:mm');
          };
          return <span key={`createdAt-${record.id}`}>{getFormatDate(createdAt)}</span>;
        },
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: 200,
        render: remark => <Tooltip text={remark || replaceSign} length={12} />,
      },
      {
        title: '区块链认证',
        key: 'block',
        width: 120,
        render: (__, record) => {
          const { hash } = record || {};
          if (hash) return changeChineseToLocale('是');
          return changeChineseToLocale('否');
        },
      },
      {
        title: '是否篡改',
        key: 'changed',
        width: 120,
        render: (__, record) => {
          const { hash, changed } = record || {};
          if (hash && changed) return changeChineseToLocale('是');
          return changeChineseToLocale('否');
        },
      },
    ];
    return columns;
  };

  render() {
    const { data, refetch, userQrCode, isBatchOperation, handleSelect, isAllChecked } = this.props;
    const { selectedRows } = this.state;
    const columns = this.getColumns().filter(n => n);
    const _selectedRows = selectedRows || [];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        const multiSelectedRows = _selectedRows.concat(selectedRows);
        this.setState({ selectedRows: _.uniq(multiSelectedRows) });
        handleSelect(_.uniq(multiSelectedRows));
      },
      onSelect: (record, selected) => {
        if (!selected) {
          const selectedRows = _selectedRows.filter(n => n.id !== record.id);
          this.setState({ selectedRows });
          handleSelect(_.uniq(selectedRows));
        }
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        if (!selected) {
          const diffSelectedRows = _selectedRows.filter(n => {
            return changeRows.map(m => m.id).indexOf(n.id) === -1;
          });
          this.setState({ selectedRows: diffSelectedRows });
          handleSelect(diffSelectedRows);
        }
      },
      getCheckboxProps: () => ({
        disabled: isAllChecked,
      }),
      selectedRowKeys: (_selectedRows && _selectedRows.map(n => n.id)) || [],
    };

    return (
      <RestPagingTable
        bordered
        dataSource={(data && data.data) || []}
        total={data && data.total}
        rowKey={record => record.id}
        columns={columns}
        scroll={{ x: true }}
        refetch={refetch}
        rowSelection={isBatchOperation ? rowSelection : null}
      />
    );
  }
}

Table.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Table;
