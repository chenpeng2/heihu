import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';

import { Tooltip, Spin, RestPagingTable, Button } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import { middleGrey } from 'src/styles/color';
import { getPurchaseOrders } from 'src/services/cooperate/purchaseOrder';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';
import { Big } from 'src/utils/number';
import { changeTextLanguage } from 'src/utils/locale/utils';

// 一个订单有多个物料，现在需要根据物料来将订单拆分
const formatPurchaseListData = data => {
  if (!Array.isArray(data) || !data.length) return null;

  const res = [];

  data.forEach(i => {
    const { materialList, ...rest } = i;
    materialList.forEach(j => {
      const { id } = j || {};
      res.push({ materialInfo: j, rowSelectionKey: id || uuid, ...rest });
    });
  });

  return res;
};

class PurchaseOrderList extends Component {
  state = {
    data: [],
    total: 0,
    loading: false,
    selectedRows: [],
    purchaseOrderCode: null,
  };

  componentDidMount() {
    this.fetchAndSetPurchaseOrderListData();
  }

  fetchAndSetPurchaseOrderListData = params => {
    this.setState({ loading: true });
    const _params = { ...params, size: 20 };

    getPurchaseOrders(_params)
      .then(({ data: { data, total } }) => {
        this.setState({
          data: formatPurchaseListData(data) || [],
          total,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderFilter = () => {
    const { intl } = this.context;

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'inline-block', color: middleGrey }}>
            {changeTextLanguage(intl, { id: 'key828', defaultMessage: '销售订单' })}
          </div>
          <div style={{ display: 'inline-block', marginLeft: 5 }}>
            <SearchSelect
              type={'purchaseOrder'}
              value={this.state.value}
              style={{ width: 200 }}
              onChange={value => {
                this.setState({ purchaseOrderCode: value ? value.key : null, value });
              }}
            />
          </div>
        </div>
        <div>
          <Button
            icon="search"
            onClick={() => {
              const { purchaseOrderCode } = this.state;
              this.fetchAndSetPurchaseOrderListData({ purchaseOrderCode });
            }}
          >
            {changeTextLanguage(intl, { id: 'key3196', defaultMessage: '查询' })}
          </Button>
          <span
            style={{ color: middleGrey, marginLeft: 10, verticalAlign: 'middle', cursor: 'pointer' }}
            onClick={() => {
              this.setState({ purchaseOrderCode: null, value: undefined }, () => {
                this.fetchAndSetPurchaseOrderListData();
              });
            }}
          >
            {changeTextLanguage(intl, { id: 'key226', defaultMessage: '重置' })}
          </span>
        </div>
      </div>
    );
  };

  getColumns = () => {
    return [
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCode',
        intlId: 'key424',
        width: 100,
        render: data => {
          return <Tooltip text={data || replaceSign} length={10} />;
        },
      },
      {
        title: '物料',
        dataIndex: 'materialInfo',
        intlId: 'key126',
        width: 200,
        render: data => {
          const { materialName, materialCode } = data || {};

          const text = materialCode && materialName ? `${materialCode}/${materialName}` : replaceSign;
          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '需求总数',
        key: 'materialAmount',
        intlId: 'key2114',
        width: 100,
        render: (__, record) => {
          const { materialInfo } = record || {};
          const { amount, amountDone, amountRetrieve, unitName } = materialInfo || {};
          const amountPlan = Big(amount)
            .minus(amountDone)
            .plus(amountRetrieve)
            .valueOf();

          const text = typeof amountPlan === 'number' && unitName ? `${amountPlan} ${unitName}` : replaceSign;
          return <Tooltip text={text} length={15} />;
        },
      },
      {
        title: '客户',
        dataIndex: 'customer.name',
        intlId: 'key781',
        width: 200,
        render: name => {
          return name || replaceSign;
        },
      },
      {
        title: '交货日期',
        dataIndex: 'materialInfo.targetDate',
        intlId: 'key393',
        width: 100,
        render: data => (data ? moment(data).format('YYYY/MM/DD') : replaceSign),
      },
    ];
  };

  getRowSelection = () => {
    const _selectedRows = this.state.selectedRows || [];
    return {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRows });
      },
      selectedRowKeys: (_selectedRows && _selectedRows.map(n => n && n.rowSelectionKey)) || [],
    };
  };

  renderTable = () => {
    const { data } = this.state;
    const rowSelection = this.getRowSelection();
    // 为了rowSelection
    const _data = data.map(i => {
      // 唯一性
      i.key = i && i.rowSelectionKey;
      return i;
    });

    return (
      <RestPagingTable
        rowSelection={rowSelection}
        scroll={{ y: 250 }}
        style={{ margin: 0 }}
        columns={this.getColumns()}
        dataSource={_data || []}
        pagination={false}
      />
    );
  };

  renderFooter = () => {
    const { onClose, cbForSure, showScroll } = this.props;
    const { intl } = this.context;
    const { selectedRows } = this.state;
    const baseStyle = { width: 120 };

    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <Button
          style={{ ...baseStyle }}
          type={'default'}
          onClick={() => {
            if (typeof onClose === 'function') onClose();
            if (typeof showScroll === 'function') showScroll();
          }}
        >
          {changeTextLanguage(intl, { id: 'key490', defaultMessage: '取消' })}
        </Button>
        <Button
          type={'primary'}
          style={{ ...baseStyle, marginLeft: 10 }}
          onClick={async () => {
            if (typeof cbForSure === 'function') {
              cbForSure(selectedRows);
            }
            if (typeof onClose === 'function') onClose();
            if (typeof showScroll === 'function') showScroll();
          }}
        >
          {changeTextLanguage(intl, { id: 'key1849', defaultMessage: '确定' })}
        </Button>
      </div>
    );
  };

  render() {
    const { style } = this.props;
    return (
      <Spin spinning={this.state.loading}>
        <div style={{ margin: 20, ...style }}>
          {this.renderFilter()}
          {this.renderTable()}
          {this.renderFooter()}
        </div>
      </Spin>
    );
  }
}

PurchaseOrderList.propTypes = {
  style: PropTypes.object,
  onClose: PropTypes.any,
  cbForSure: PropTypes.func,
  showSrcoll: PropTypes.func,
};

PurchaseOrderList.contextTypes = {
  intl: PropTypes.any,
};

export default PurchaseOrderList;
