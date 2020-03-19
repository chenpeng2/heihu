import React, { Component } from 'react';
import _ from 'lodash';

import { Table, Tooltip } from 'src/components';
import { replaceSign } from 'src/constants';

import { findStatus, findUseLogic } from '../utils';

type Props = {
  style: {},
  data: [],
};

class MaterialListTable extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    return [
      {
        title: '订单编号',
        width: 150,
        dataIndex: 'purchaseOrderCode',
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
      {
        title: '项目编号',
        width: 150,
        dataIndex: 'projectCode',
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
      {
        title: '物料编号/名称',
        width: 150,
        dataIndex: 'materialInfo',
        render: data => {
          const { name, code } = data || {};
          const _text = name && code ? `${name}/${code}` : replaceSign;
          return <Tooltip text={_text} length={20} />;
        },
      },
      {
        title: '数量',
        width: 150,
        dataIndex: 'qualityAmounts',
        render: (data, record) => {
          const unitName = _.get(record, 'materialInfo.unitName');

          if (Array.isArray(data)) {
            const text = data
              .filter(a => a)
              .map(a => {
                const { amount, qcStatus } = a;
                const name = findUseLogic(qcStatus) ? findUseLogic(qcStatus).name : null;
                return `${name}${amount}${unitName || replaceSign}`;
              })
              .join(',');

            return <Tooltip text={text} length={20} />;
          }
          return replaceSign;
        },
      },
      {
        title: '目的地',
        width: 150,
        dataIndex: 'targetStorage',
        render: data => {
          const name = _.get(data, 'name');

          return <Tooltip text={name} length={20} />;
        },
      },
      {
        title: '占用逻辑',
        dataIndex: 'qualityAmounts',
        width: 150,
        key: 'useLogic',
        render: data => {
          if (Array.isArray(data)) {
            const text = data
              .filter(a => a)
              .map(a => {
                const { qcStatus } = a;
                const name = findUseLogic(qcStatus) ? findUseLogic(qcStatus).name : null;
                return `${name}`;
              })
              .join(',');

            return <Tooltip text={text} length={20} />;
          }

          return replaceSign;
        },
      },
    ];
  };

  render() {
    const { data } = this.props;
    const columns = this.getColumns();

    return (
      <Table
        columns={columns}
        dataSource={data || []}
        pagination={false}
        style={{ width: 800, margin: 0 }}
        scroll={{ x: 1200 }}
      />
    );
  }
}

export default MaterialListTable;
