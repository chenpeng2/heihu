import React, { Component } from 'react';
import { Table, Tooltip } from 'components';
import { replaceSign } from 'constants';
import { arrayIsEmpty } from 'utils/array';
import moment from 'utils/time';
import { thousandBitSeparator } from 'utils/number';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';

type Props = {
  style: {},
  material_data: [],
  columns: [],
};

class Material_List_Tree_Table extends Component {
  props: Props;
  state = {};

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    this.setState({ config });
  }

  get_columns = () => {
    const base_render = data => (data ? <Tooltip text={data} length={15} /> : replaceSign);
    const { config } = this.state;
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    return [
      {
        title: '编号/名称',
        dataIndex: 'material',
        key: 'codeAndName',
        width: 250,
        render: data => {
          const { code, name } = data || {};
          if (code && name) {
            return <Tooltip text={`${code}/${name}`} length={20} />;
          }
          return null;
        },
      },
      {
        title: '数量',
        key: 'amount',
        width: 200,
        render: (data, record) => {
          const { material, children, currentUnitName, amountPlanned } = record;
          const { amount, unit } = material || {};

          if (children) {
            return amount >= 0 ? `${amount} ${unit || replaceSign} ` : replaceSign;
          }

          const text = `${thousandBitSeparator(amountPlanned)} ${currentUnitName || unit || replaceSign} `;
          return amountPlanned >= 0 ? <Tooltip text={text} length={15} /> : replaceSign;
        },
      },
      {
        title: '需求时间',
        dataIndex: 'demandTime',
        key: 'demandTime',
        width: 200,
        render: data => {
          return data ? moment(data).format('YYYY/MM/DD') : replaceSign;
        },
      },
      {
        title: 'ETA',
        dataIndex: 'eta',
        width: 200,
        key: 'eta',
        render: data => {
          return data ? moment(data).format('YYYY/MM/DD') : replaceSign;
        },
      },
      {
        title: '入厂数',
        dataIndex: 'amountInFactory',
        width: 200,
        key: 'amountInFactory',
        render: (data, record) => {
          const { material, currentUnitName } = record;
          const { unit } = material || {};
          const text = `${thousandBitSeparator(data)} ${currentUnitName || unit || replaceSign} `;
          return data ? <Tooltip text={text} length={15} /> : replaceSign;
        },
      },
      {
        title: '退料数',
        dataIndex: 'returnOut',
        width: 200,
        key: 'returnOut',
        render: (data, record) => {
          const { material } = record;
          const { unit } = material || {};
          const total = data && data.length ? data.map(n => n.amount).reduce((n, m) => n + m) : replaceSign;
          const text = `${thousandBitSeparator(total)} ${unit || replaceSign} `;
          return data ? <Tooltip text={text} length={15} /> : replaceSign;
        },
      },
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCode',
        width: 200,
        key: 'purchaseOrderCode',
        render: base_render,
      },
      {
        title: configValue === 'manager' ? '计划工单编号' : '项目编号',
        dataIndex: configValue === 'manager' ? 'planWorkOrderCode' : 'projectCode',
        width: 200,
        key: 'projectCode',
        render: base_render,
      },
      {
        title: '关注人',
        dataIndex: 'concernedPersonList',
        key: 'focus_man',
        width: 200,
        render: data => {
          if (arrayIsEmpty(data)) return replaceSign;
          return <Tooltip text={data.map(x => x.name).join(',')} length={12} />;
        },
      },
      {
        title: '启用预警',
        dataIndex: 'warning',
        key: 'warning',
        width: 120,
        render: (data, record) => (data ? '是' : '否'),
      },
      {
        title: '预警提前期',
        dataIndex: 'warningLine',
        key: 'warningLine',
        width: 130,
        render: (data, record) => (typeof data === 'number' ? `${thousandBitSeparator(data)} 天` : replaceSign),
      },
      {
        title: '备注',
        dataIndex: 'note',
        key: 'note',
        width: 200,
        render: data => {
          return data || replaceSign;
        },
      },
    ];
  };

  render() {
    const { material_data, style, columns, ...rest } = this.props;
    const _columns = columns || this.get_columns();

    return (
      <Table
        dataSource={material_data}
        pagination={false}
        columns={_columns}
        style={{ maxWidth: 1000, margin: '0 10px', ...style }}
        scroll={{ x: 1700, y: 300 }}
        {...rest}
      />
    );
  }
}

export default Material_List_Tree_Table;
