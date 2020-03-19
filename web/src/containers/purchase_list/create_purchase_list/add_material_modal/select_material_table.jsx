import React, { Component } from 'react';

import { Table, Tooltip, Spin } from 'components';
import { replaceSign } from 'constants';
import { thousandBitSeparator } from 'utils/number';

const TABLE_WIDTH = 786;


type Props = {
  style: {},
  data: [],
  loading: boolean,
  configValue: any,
  configValue: string,
  filter_material_data: [],
  change_selected_material_value: () => {},
};

class Select_Material_Table extends Component {
  props: Props;
  state = {
    selectedRows: [],
  };

  get_columns = () => {
    const { configValue } = this.props;
    return [
      {
        title: '编号/名称',
        dataIndex: 'material',
        key: 'codeAndName',
        width: 200,
        render: (data) => {
          const { materialCode, materialName } = data || {};
          return materialCode || materialName ? <Tooltip text={`${materialCode}/${materialName}`} length={15} /> : replaceSign;
        },
        filters: this.props.filter_material_data || [],
        onFilter: (value, record) => {
          const { material } = record || {};
          const { materialCode, materialName } = material || {};

          return value === `${materialCode}/${materialName}`;
        },
      },
      {
        title: '可采购数量',
        dataIndex: 'material',
        width: 200,
        key: 'amount',
        render: (data) => {
          const { amount, amountConfirm, unit } = data || {};
          const text = `${thousandBitSeparator(amountConfirm || amount)} ${unit.label || replaceSign}`;
          return <Tooltip text={text} length={10} />;
        },
      },
      {
        title: '数量',
        dataIndex: 'material',
        width: 200,
        key: 'amountPlanned',
        render: (data) => {
          const { amountPlanned, unit } = data || {};
          const text = `${thousandBitSeparator(amountPlanned)} ${unit.label || replaceSign}`;
          return amountPlanned >= 0 || unit ? <Tooltip text={text} length={10} /> : replaceSign;
        },
      },
      {
        title: '订单编号',
        dataIndex: configValue === 'manager' ? 'workOrder' : 'project',
        width: 200,
        key: 'purchaseOrderCode',
        render: (data) => {
          const { purchaseOrderCode } = data || {};
          return purchaseOrderCode ? <Tooltip text={purchaseOrderCode} length={15} /> : replaceSign;
        },
      },
      {
        title: configValue === 'manager' ? '计划工单编号' : '项目编号',
        dataIndex: configValue === 'manager' ? 'workOrder' : 'project',
        width: 200,
        key: 'projectCode',
        render: (data) => {
          let code = '';
          if (configValue === 'manager') {
            code = data.workOrderCode;
          } else {
            code = data.projectCode;
          }
          return code ? <Tooltip text={code} length={15} /> : replaceSign;
        },
      },
    ];
  };

  render() {
    const { data, change_selected_material_value, loading, configValue } = this.props;
    const columns = this.get_columns();
    const _selectedRows = this.state.selectedRows || [];
    const table_style = {
      width: TABLE_WIDTH,
      margin: 'auto',
    };

    return (
      <Spin spinning={loading}>
        <Table
          rowSelection={{
            onSelect: (record, selected, selectedRows) => {
              change_selected_material_value(selectedRows);
              this.setState({ selectedRows });
            },
            onSelectAll: (selected, selectedRows) => {
              change_selected_material_value(selectedRows);
              this.setState({ selectedRows });
            },
            selectedRowKeys: _selectedRows
              && _selectedRows.map(n => `${n.material.materialCode}${configValue === 'manager' ? n.workOrder.workOrderCode : n.project.projectCode}`)
              || [],
          }}
          scroll={{ y: 250 }}
          style={table_style}
          tableStyle={{ margin: 0 }}
          dataSource={data || []}
          columns={columns}
          pagination={false}
          rowKey={record => `${record.material.materialCode}${configValue === 'manager' ? record.workOrder.workOrderCode : record.project.projectCode}`}
        />
      </Spin>
    );
  }
}

export default Select_Material_Table;
