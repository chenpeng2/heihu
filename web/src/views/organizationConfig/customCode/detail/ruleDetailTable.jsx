import React, { Component } from 'react';
import PropTypes from 'prop-types';

import BasicTable from 'src/components/table/basicTable';
import { replaceSign } from 'src/constants';

import { findRuleType, RULE_TYPE, findSeqType } from '../utils';

class RuleDetailTable extends Component {
  state = {};

  getColumns = () => {
    return [
      {
        title: '行序列',
        dataIndex: 'serial',
        render: (data, __, index) => <span>{data || index + 1}</span>,
      },
      {
        title: '类型',
        dataIndex: 'type',
        render: data => {
          const { name } = findRuleType(data) || {};
          return <span>{name}</span>;
        },
      },
      {
        title: '长度',
        key: 'length',
        render: (__, record) => {
          // 不同的类型计算长度的方法不同
          const { type, serialLength, consValue, dateFormat } = record || {};
          if (type === RULE_TYPE.seq.value) {
            return <span>{serialLength}</span>;
          }
          if (type === RULE_TYPE.constant.value) {
            return <span>{consValue ? consValue.length : replaceSign}</span>;
          }
          if (type === RULE_TYPE.date.value) {
            return <span>{dateFormat ? dateFormat.length : replaceSign}</span>;
          }
          return <span>{replaceSign}</span>;
        },
      },
      {
        title: '格式',
        dataIndex: 'dateFormat',
        render: data => <span>{data || replaceSign}</span>,
      },
      {
        title: '设置值',
        dataIndex: 'consValue',
        render: data => <span>{data || replaceSign}</span>,
      },
      {
        title: '起始值',
        dataIndex: 'serialFrom',
        render: data => <span>{data || replaceSign}</span>,
      },
      {
        title: '步长',
        dataIndex: 'serialStep',
        render: data => <span>{data || replaceSign}</span>,
      },
      {
        title: '流水码制',
        dataIndex: 'serialFormat',
        render: data => {
          const { name } = findSeqType(data) || {};
          return <span>{name || replaceSign}</span>;
        },
      },
    ];
  };

  render() {
    const { tableData = [] } = this.props;

    return (
      <div>
        <BasicTable
          style={{ margin: 0, width: 800 }}
          columns={this.getColumns()}
          dataSource={tableData}
          pagination={false}
        />
      </div>
    );
  }
}

RuleDetailTable.propTypes = {
  style: PropTypes.object,
  tableData: PropTypes.any,
};

export default RuleDetailTable;
