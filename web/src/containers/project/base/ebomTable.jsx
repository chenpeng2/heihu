import React, { Component } from 'react';

import { thousandBitSeparator } from 'utils/number';
import { Table, Tooltip } from 'src/components';
import { replaceSign } from 'src/constants';

type Props = {
  style: {},
  data: [],
};

class EbomTable extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    return [
      {
        title: '物料编号/名称',
        dataIndex: 'material',
        width: 200,
        render: data => {
          const { code, name } = data || {};
          return data ? <Tooltip text={`${code}/${name}`} length={15} /> : replaceSign;
        },
      },
      {
        title: '数量',
        dataIndex: 'amount',
        width: 200,
        render: (data, record) => {
          const { material, currentUnit } = record || {};
          const { unitName } = material || {};
          const { name: currentUnitName } = currentUnit || {};
          return data ? `${thousandBitSeparator(data)} ${currentUnitName || unitName}` : replaceSign;
        },
      },
    ];
  };

  render() {
    const { data, style, ...rest } = this.props;
    const columns = this.getColumns();

    return (
      <Table
        style={{ margin: 0 }}
        tableStyle={{ ...style, minWidth: 0 }}
        dataSource={data || []}
        columns={columns}
        pagination={false}
        scroll={{ y: 260 }}
        {...rest}
      />
    );
  }
}

export default EbomTable;
