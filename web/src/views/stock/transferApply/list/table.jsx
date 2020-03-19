import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { message, FormattedMessage, Button, Icon, Popover, Badge, RestPagingTable, Tooltip } from 'src/components';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';
import { primary, fontSub } from 'src/styles/color/index';
import { isTransferApplyWithMoveTransactionConfig } from 'src/utils/organizationConfig';
import { arrayIsEmpty } from 'src/utils/array';

import {
  TRANSFER_APPLY_SOURCE_TYPE,
  getTransferApplyMergePageUrl,
  APPLY_STATUS,
  findApplyStatus,
  findTransferApplySourceType,
} from '../util';
import UpdateStatus from '../baseComponent/updateStatus';
import MaterialListDetailTable from './materialListDetailTable';
import LinkToCreatePage from '../baseComponent/linkToCreatePage';

const TipMessage = '已创建，合并创建，相同的移动事务，目标仓位和发出仓库相同的转移申请才可以合并';

class Table extends Component {
  state = {
    columns: [],
    showRowSelection: false,
    selectedRowKeys: [],
    selectedRows: [],
  };

  getColumns = () => {
    return [
      {
        title: '编号',
        dataIndex: 'code',
        width: 140,
        fixed: 'left',
        render: (data, record) => {
          return (
            <Popover placement={'bottom'} content={<MaterialListDetailTable key={Math.random()} data={record} />}>
              <span style={{ whiteSpace: 'nowrap' }}>
                <span style={{ color: primary, cursor: 'pointer' }}>{data || replaceSign}</span>
                <Icon type={'down'} style={{ fontSize: 12, color: primary }} />
              </span>
            </Popover>
          );
        },
      },
      isTransferApplyWithMoveTransactionConfig()
        ? {
            title: '移动事务',
            dataIndex: 'transactionName',
            width: 200,
            render: data => {
              return <Tooltip text={data || replaceSign} length={15} />;
            },
          }
        : null,
      {
        title: '目标仓位',
        dataIndex: 'targetStorageName',
        width: 140,
        render: data => {
          return <Tooltip text={data || replaceSign} length={12} />;
        },
      },
      {
        title: '发出仓库',
        dataIndex: 'sourceWarehouseName',
        width: 140,
        render: data => {
          return <Tooltip text={data || replaceSign} length={12} />;
        },
      },
      {
        title: '需求时间',
        width: 140,
        dataIndex: 'requireTime',
        render: data => {
          if (!data) return <span>{replaceSign}</span>;

          let text;
          if (moment(data).format('HH:mm') === '00:00') {
            // 如果没有具体的时间只展示日期
            text = moment(data).format('YYYY/MM/DD');
          } else {
            text = moment(data).format('YYYY/MM/DD HH:mm');
          }

          return <span>{text}</span>;
        },
      },
      {
        title: '创建人',
        width: 140,
        dataIndex: 'operatorName',
        render: data => {
          return <Tooltip text={data || replaceSign} length={12} />;
        },
      },
      {
        title: '创建时间',
        width: 140,
        dataIndex: 'createdAt',
        render: data => {
          return <span>{moment(data).format('YYYY/MM/DD HH:mm')}</span>;
        },
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: data => {
          return <Tooltip text={data || replaceSign} length={12} />;
        },
      },
      {
        title: '来源类型',
        width: 140,
        dataIndex: 'sourceType',
        render: data => {
          const { name } = findTransferApplySourceType(data) || {};
          return name || replaceSign;
        },
      },
      {
        title: '来源内容',
        width: 140,
        dataIndex: 'sourceId',
        render: data => data || replaceSign,
      },
      {
        title: '申请状态',
        dataIndex: 'status',
        width: 140,
        render: data => {
          const { name, color } = findApplyStatus(data) || {};

          if (name) return <Badge.MyBadge color={color} text={name} />;
          return <span>{replaceSign}</span>;
        },
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 200,
        render: (__, record) => {
          const { refetch } = this.props;
          return <UpdateStatus refetch={refetch} data={record} />;
        },
      },
    ].filter(i => i);
  };

  getRowSelection = data => {
    const { selectedRowKeys, selectedRows: _selectedRows } = this.state;
    const { targetStorageId, sourceWarehouseCode, transactionCode } = arrayIsEmpty(_selectedRows)
      ? {}
      : _selectedRows[0];
    let { sourceType: targetSourceType } = arrayIsEmpty(_selectedRows) ? {} : _selectedRows[0];

    if (!targetSourceType) targetSourceType = TRANSFER_APPLY_SOURCE_TYPE.none.value;

    return {
      selectedRowKeys,
      getCheckboxProps: record => {
        const {
          sourceType: recordSourceType,
          status,
          targetStorageId: id,
          sourceWarehouseCode: code,
          transactionCode: recordTransactionCode,
        } = record || {};
        console.log(record);
        // 只有已创建,合并创建的转移申请可以合并
        let disabled = status !== APPLY_STATUS.created.value && status !== APPLY_STATUS.mergeCreated.value;

        // 必须和已经选过的目的地，来源相同
        if (targetStorageId && sourceWarehouseCode && (id !== targetStorageId || code !== sourceWarehouseCode)) {
          disabled = true;
        }

        // 当存在来源类型时, 仅相同来源类型的转移申请可以合并, 来源类型为空可以和任意来源类型进行合并
        if (targetSourceType === TRANSFER_APPLY_SOURCE_TYPE.none.value) {
          targetSourceType = recordSourceType;
        } else if (
          recordSourceType !== TRANSFER_APPLY_SOURCE_TYPE.none.value &&
          recordSourceType !== targetSourceType
        ) {
          disabled = true;
        }

        // 当存在移动事务时, 仅相同移动事务的转移申请可以合并, 移动事务为空不可以和移动事务不为空的转移申请进行合并
        if (transactionCode && transactionCode !== recordTransactionCode) {
          disabled = true;
        }
        return { disabled };
      },
      onSelectAll: (selected, selectedRows) => {
        // 全选的时候需要做检查
        let valid = true;
        if (selected && !arrayIsEmpty(selectedRows)) {
          let storageId;
          let warehouseCode;
          let transactionCode;
          selectedRows.forEach(i => {
            const { targetStorageId, sourceWarehouseCode, transactionCode: code } = i || {};
            if (!storageId) {
              storageId = targetStorageId;
            } else if (storageId !== targetStorageId) {
              valid = false;
            }

            if (!sourceWarehouseCode) {
              warehouseCode = sourceWarehouseCode;
            } else if (warehouseCode !== sourceWarehouseCode) {
              valid = false;
            }

            if (!transactionCode) {
              transactionCode = code;
            } else if (transactionCode !== code) {
              valid = false;
            }
          });
        }

        if (!valid) {
          this.setState({ selectedRowKeys, selectedRows: _selectedRows }, () => {
            message.warn(TipMessage);
          });
        }
      },
      onChange: (selectedRowKeys, selectedRows) => {
        const newSelectedRows = _.pullAllBy(_selectedRows, data, 'key').concat(selectedRows);
        this.setState({
          selectedRowKeys,
          selectedRows: newSelectedRows,
        });
      },
    };
  };

  render() {
    const { history, tableData, dataTotal, style, refetch } = this.props;
    const { showRowSelection, selectedRowKeys } = this.state;

    const columns = this.getColumns();
    const data = arrayIsEmpty(tableData)
      ? []
      : tableData.map(i => {
          i.key = i.id;
          return i;
        });

    return (
      <div style={style}>
        <div style={{ margin: 20 }}>
          {showRowSelection ? (
            <React.Fragment>
              <Button
                icon="plus-circle-o"
                disabled={arrayIsEmpty(selectedRowKeys) || selectedRowKeys.length < 2}
                onClick={() => {
                  history.push({
                    pathname: getTransferApplyMergePageUrl(),
                    state: { transferApplyIds: selectedRowKeys },
                  });
                }}
              >
                合并
              </Button>
              <Button
                type={'ghost'}
                onClick={() => {
                  this.setState({ showRowSelection: false, selectedRowKeys: [] });
                }}
                style={{ marginLeft: 10 }}
              >
                取消
              </Button>
              <FormattedMessage style={{ marginLeft: 10, color: fontSub }} defaultMessage={TipMessage} />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <LinkToCreatePage />
              <Button
                icon="plus-circle-o"
                onClick={() => this.setState({ showRowSelection: true })}
                style={{ marginLeft: 10 }}
              >
                合并转移申请
              </Button>
            </React.Fragment>
          )}
        </div>
        <RestPagingTable
          rowSelection={showRowSelection ? this.getRowSelection(data) : null}
          refetch={refetch}
          showPageSizeChanger
          columns={columns}
          dataSource={data || []}
          total={dataTotal || 0}
          scroll={{ x: 2000 }}
        />
      </div>
    );
  }
}

Table.propTypes = {
  style: PropTypes.object,
  tableData: PropTypes.any,
  dataTotal: PropTypes.any,
  refetch: PropTypes.any,
  history: PropTypes.any,
};

export default withRouter(Table);
