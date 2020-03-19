import React, { Component } from 'react';
import _ from 'lodash';
import auth from 'utils/auth';
import { Table, Link, buttonAuthorityWrapper, Tooltip } from 'src/components';
import { Modal } from 'antd';
import { replaceSign } from 'src/constants';
import LinkToUpdatePurchaseList from 'src/containers/purchase_list/base/link_to_update_purchase_list_page';
import LinkToEditPurchaseList from 'src/containers/purchase_list/base/link_to_edit_purchase_list_page';
import CancelPurchaseList from 'src/containers/purchase_list/base/cancel_purchase_list';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import { update_purchase_list_state } from 'src/services/cooperate/purchase_list';
import { getQuery } from 'src/routes/getRouteParams';
import { TABLE_UNIQUE_KEY } from 'src/views/cooperate/purchase_list/constants';
import LinkToPurchaseListDetail from '../base/link_to_purchase_list_detail';
import StatusDisplay from '../base/status_display';
import ProgressPopover from './progress_popover';

type Props = {
  dataSource: [],
  match: {},
  purchase_list_total_amount: number,
  fetchData: () => {},
  loading: boolean,
  isBatchOperation: boolean,
  isBulkaction: boolean,
  pagination: {},
  selectRow: () => {},
};
const LinkWithAuth = buttonAuthorityWrapper(Link);

class Purchase_List_Table extends Component {
  props: Props;
  state = {
    selectedRows: [],
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    this.setState({ config });
  }

  componentWillReceiveProps(nextProps) {
    const { isBatchOperation } = nextProps;
    if (!isBatchOperation) {
      this.setState({ selectedRows: [] });
    }
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.props.fetchData({
      page: pagination && pagination.current,
      size: (pagination && pagination.pageSize) || 10,
    });
  };

  get_columns = () => {
    const { fetchData, isBatchOperation } = this.props;
    const { config } = this.state;
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    const useQrCode = config && config.config_use_qrcode.configValue;

    // 操作栏
    const render_operations = (props: {
      record: {},
      state: string,
      code: number,
      procureOrderCode: string,
      amountFinished: number,
    }) => {
      const { match } = this.props;
      const queryMatch = getQuery(match);
      const { state, code, amountFinished, procureOrderCode } = props;
      // 如果采购清单的状态是已经申请，那么可以编辑和更新，其他状态都只可以查看
      if (state === 'applied') {
        return (
          <div>
            <LinkToPurchaseListDetail purchase_list_code={code} code={procureOrderCode} />
            <LinkToUpdatePurchaseList purchase_list_code={code} />
            <CancelPurchaseList
              purchase_list_code={procureOrderCode}
              cb={() => {
                fetchData(queryMatch);
              }}
            />
          </div>
        );
      }
      if (state === 'created') {
        return (
          <div>
            <LinkToPurchaseListDetail purchase_list_code={code} code={procureOrderCode} />
            <LinkToEditPurchaseList purchase_list_code={code} />
            <LinkWithAuth
              style={{ margin: '0 5px' }}
              auth={auth.WEB_EDIT_PROCURE_ORDER}
              onClick={() => {
                update_purchase_list_state({ toStatus: 'applied', procureOrderCode }).then(() => {
                  Modal.success({
                    title: '提交成功',
                  });
                  fetchData(queryMatch);
                });
              }}
            >
              提交
            </LinkWithAuth>
          </div>
        );
      }
      return (
        <div>
          <LinkToPurchaseListDetail purchase_list_code={code} code={procureOrderCode} />
        </div>
      );
    };

    return [
      {
        title: '编号',
        dataIndex: 'procureOrderCode',
        key: 'procureOrderCode',
        width: 150,
        render: data => {
          if (data) {
            return <Tooltip text={data} length={15} />;
          }
          return replaceSign;
        },
      },
      {
        title: '处理人',
        dataIndex: 'operator',
        width: 150,
        key: 'operator',
        render: data => {
          return data && data.name ? data.name : replaceSign;
        },
      },
      useQrCode === 'true'
        ? {
            title: '供应商',
            dataIndex: 'supplier',
            width: 200,
            key: 'supplier',
            render: data => {
              return (data && data.name) || replaceSign;
            },
          }
        : null,
      {
        title: '状态',
        dataIndex: 'procureOrderStatus',
        width: 150,
        key: 'status',
        render: data => {
          if (!data) return replaceSign;

          return <StatusDisplay status_value={data} />;
        },
      },
      {
        title: '进度',
        key: 'progress',
        width: 150,
        render: (_, record) => {
          return <ProgressPopover data={record} />;
        },
      },
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCodes',
        width: 100,
        key: 'purchaseOrderCodes',
        render: data => {
          if (!Array.isArray(data) || !(data && data[0])) return replaceSign;

          return <Tooltip text={data.join(',')} length={15} />;
        },
      },
      {
        title: configValue === 'manager' ? '计划工单编号' : '项目编号',
        dataIndex: configValue === 'manager' ? 'planWorkerOrderCodes' : 'projectCodes',
        width: 100,
        kye: 'projectCodes',
        render: data => {
          if (!Array.isArray(data) || !(data && data[0])) return replaceSign;

          return <Tooltip text={data.join(',')} length={15} />;
        },
      },
      !isBatchOperation
        ? {
            title: '操作',
            width: 200,
            key: 'product',
            render: (_, record) => {
              const { id, procureOrderStatus, amountFinished, procureOrderCode } = record || {};
              const { code } = procureOrderStatus || {};

              return render_operations({ record, state: code, code: id, procureOrderCode, amountFinished });
            },
          }
        : null,
    ];
  };

  render() {
    const { loading, dataSource, purchase_list_total_amount, isBatchOperation, selectRow, pagination } = this.props;
    const columns = _.compact(this.get_columns());
    const _selectedRows = this.state.selectedRows || [];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        const multiSelectedRows = _selectedRows.concat(selectedRows);
        this.setState({ selectedRows: _.uniq(multiSelectedRows) });
        selectRow(_.uniq(multiSelectedRows));
      },
      onSelect: (record, selected) => {
        if (!selected) {
          const selectedRows = _selectedRows.filter(n => n.procureOrderCode !== record.procureOrderCode);
          this.setState({ selectedRows });
          selectRow(selectedRows);
        }
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        if (!selected) {
          const diffSelectedRows = _selectedRows.filter(n => {
            return changeRows.map(m => m.procureOrderCode).indexOf(n.procureOrderCode) === -1;
          });
          this.setState({ selectedRows: diffSelectedRows });
          selectRow(diffSelectedRows);
        }
      },
      selectedRowKeys: (_selectedRows && _selectedRows.map(n => n.procureOrderCode)) || [],
    };
    return (
      <div>
        <Table
          tableUniqueKey={TABLE_UNIQUE_KEY}
          useColumnConfig
          dragable
          loading={loading}
          dataSource={dataSource}
          total={purchase_list_total_amount}
          rowSelection={isBatchOperation ? rowSelection : null}
          rowKey={record => record.procureOrderCode}
          columns={columns}
          pagination={pagination}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default Purchase_List_Table;
