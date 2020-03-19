import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { RestPagingTable, Tooltip, Link, selectAllExport, Button, Checkbox, Badge, Text } from 'src/components';
import {
  CHECKCOUNT_TYPE,
  QCCONFIG_STATE,
  QCCONFIG_INVALID,
  QCCONFIG_VALID,
} from 'src/views/qualityManagement/constants';
import { replaceSign } from 'src/constants';
import { getQcConfigList, updateQcConfigState } from 'src/services/qcConfig';
import { showLoading } from 'src/utils/loading';
import { border, error, primary } from 'src/styles/color';
import { getQuery } from 'src/routes/getRouteParams';
import QcConfigImportButton from './import/importButton';
import {
  baseInfoHeaders,
  materialsHeader,
  qcCheckItemsHeader,
  baseInfoHeadersDesc,
  materialsHeaderDesc,
  qcCheckItemsHeaderDesc,
} from '../constants';
import {
  getCreateQcConfigUrl,
  getExportFileName,
  formatBaseInfoExportData,
  formatMaterialsExportData,
  formatQcCheckItemsExportData,
} from '../utils';
import { toQcConfigDetail, toEditQcConfig, toCopyQcConfig } from '../../navigation';

const MyBadge = Badge.MyBadge;
const LinkGroup = Link.Group;

type Props = {
  data: [],
  history: any,
  total: Number,
  refreshData: () => {},
  match: {},
};

class QcConfigTable extends Component {
  props: Props;
  state = {
    modalVisible: false,
    modalData: null,
    isBatchOperation: false,
    isAllChecked: false,
    selectedAmount: 0,
    dataSource: [],
    selectedRows: [],
  };

  getColumns = () => {
    return [
      {
        title: '编号',
        dataIndex: 'code',
        width: 90,
        render: code => {
          if (!code) return replaceSign;
          return <Tooltip text={code} width={90} />;
        },
      },
      {
        title: '名称',
        dataIndex: 'name',
        width: 140,
        render: name => {
          return <Tooltip text={name || replaceSign} width={140} />;
        },
      },
      {
        title: '质检方式',
        maxWidth: { C: 6 },
        dataIndex: 'checkCountType',
        render: checkCountType => {
          return CHECKCOUNT_TYPE[checkCountType] ? <Text>{CHECKCOUNT_TYPE[checkCountType]}</Text> : replaceSign;
        },
      },
      {
        title: '质检数量',
        maxWidth: { C: 6 },
        dataIndex: 'checkCount',
        render: (checkCount, record) => {
          // 比例抽检时展示 %
          return checkCount === undefined || checkCount === null
            ? replaceSign
            : `${checkCount}${record.checkCountType === 1 ? '%' : ''}`;
        },
      },
      {
        title: '质检项列表',
        maxWidth: { C: 20 },
        dataIndex: 'qcCheckItemConfigs',
        render: qcCheckItemConfigs => {
          // 比例抽检时展示 %
          return <Tooltip text={qcCheckItemConfigs.map(e => e.checkItem && e.checkItem.name).join(',')} length={20} />;
        },
      },
      {
        title: '状态',
        width: 80,
        dataIndex: 'state',
        key: 'state',
        render: state => {
          return typeof state === 'number' ? (
            <MyBadge text={QCCONFIG_STATE[state]} color={state === 0 ? error : primary} />
          ) : (
            replaceSign
          );
        },
      },
      {
        title: '操作',
        width: 185,
        render: (_, record) => {
          return this.renderOperations(record);
        },
      },
    ];
  };

  formatExportData = data => {
    const _data = data.map(x => {
      const { name, desc } = x || {};
      const groupName = _.get(x, 'group.name');

      return {
        groupName,
        name,
        desc,
      };
    });
    return _data.map(x => Object.values(x));
  };

  handleExport = () => {
    const { match, total } = this.props;
    const { isAllChecked, selectedRows } = this.state;
    const queryMatch = getQuery(match);
    selectAllExport(
      {
        width: '30%',
      },
      {
        selectedAmount: total,
        multiExport: true,
        getExportData: async params => {
          const res = await getQcConfigList({ ...queryMatch, ...params });
          let exportData;
          if (isAllChecked) {
            exportData = _.get(res, 'data.data');
          } else {
            exportData = selectedRows;
          }
          const baseInfoValues = formatBaseInfoExportData(exportData);
          const materialsValues = formatMaterialsExportData(exportData);
          const qcCheckItemsValues = formatQcCheckItemsExportData(exportData);
          return [
            [baseInfoHeadersDesc, baseInfoHeaders, ...baseInfoValues],
            [materialsHeaderDesc, materialsHeader, ...materialsValues],
            [qcCheckItemsHeaderDesc, qcCheckItemsHeader, ...qcCheckItemsValues],
          ];
        },
        fileName: [
          getExportFileName('质检方案基础信息'),
          getExportFileName('质检方案可适用物料'),
          getExportFileName('质检方案相关质检项'),
        ],
      },
    );
  };

  renderOperations = record => {
    const { id, state } = record;

    return (
      <LinkGroup>
        <Link to={toQcConfigDetail(id)}>查看</Link>
        <Link to={toEditQcConfig(id)}>编辑</Link>
        <Link to={toCopyQcConfig(id)}>复制</Link>
        <Link
          onClick={() => {
            const updatedState = state ? QCCONFIG_INVALID : QCCONFIG_VALID;
            showLoading(true);
            updateQcConfigState(id, { state: updatedState }).then(() => {
              record.state = updatedState;
              this.forceUpdate();
              showLoading(false);
            });
          }}
        >
          {state ? '置为无效' : '置为有效'}
        </Link>
      </LinkGroup>
    );
  };

  renderExport = () => {
    const { total } = this.props;
    const { isBatchOperation, selectedAmount, isAllChecked } = this.state;
    const { changeChineseTemplateToLocale } = this.context;
    return (
      <div style={{ marginLeft: 20 }}>
        {isBatchOperation ? (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 20 }}>
            <Checkbox
              style={{ marginRight: 23 }}
              checked={isAllChecked}
              onChange={e => {
                const checked = e.target.checked;
                this.setState({ selectedAmount: checked ? total || 0 : 0, isAllChecked: checked, selectedRowKeys: [] });
              }}
            >
              全选
            </Checkbox>
            <Button disabled={selectedAmount === 0} style={{ width: 80, height: 28 }} onClick={this.handleExport}>
              确定
            </Button>
            <Button
              style={{ width: 80, height: 28, margin: '0 20px' }}
              type={'default'}
              onClick={() => {
                this.setState({ isBatchOperation: false, isAllChecked: false });
              }}
            >
              取消
            </Button>
            <span>{changeChineseTemplateToLocale('已选{amount}个', { amount: selectedAmount })}</span>
          </div>
        ) : (
          <Button
            icon="upload"
            ghost
            onClick={() => {
              this.setState({ isBatchOperation: true });
            }}
            disabled={total === 0}
          >
            批量导出
          </Button>
        )}
      </div>
    );
  };

  render() {
    const { data, refreshData, history, ...rest } = this.props;
    const { router } = this.context;
    const { selectedRows, isAllChecked, selectedRowKeys, isBatchOperation } = this.state;
    const columns = this.getColumns();
    const _selectedRows = selectedRows || [];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        const newSelectedRows = _.pullAllBy(_selectedRows, data, 'id').concat(selectedRows);
        this.setState({ selectedRows: newSelectedRows, selectedRowKeys, selectedAmount: newSelectedRows.length });
      },
      getCheckboxProps: () => ({
        disabled: isAllChecked,
      }),
      selectedRowKeys,
    };

    return (
      <div style={{ borderTop: `1px solid ${border}` }}>
        <div style={{ display: 'flex', margin: '20px' }}>
          <Button
            icon="plus-circle-o"
            onClick={() => {
              router.history.push(getCreateQcConfigUrl());
            }}
          >
            创建质检方案
          </Button>
          {this.renderExport()}
          <QcConfigImportButton history={history} />
        </div>
        <RestPagingTable
          columns={columns}
          dataSource={data || []}
          refetch={refreshData}
          {...rest}
          rowKey={record => record.id}
          rowSelection={isBatchOperation ? rowSelection : null}
        />
      </div>
    );
  }
}

QcConfigTable.contextTypes = {
  router: PropTypes.object,
  changeChineseTemplateToLocale: PropTypes.func,
};

export default withRouter(QcConfigTable);
