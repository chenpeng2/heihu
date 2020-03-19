import React, { Component } from 'react';

import { black } from 'src/styles/color';

import TableRow from './tableRow';

type Props = {
  style: {},
  dataSource: [],
  isFixed: boolean,
  columns: [],
};

class TableBody extends Component {
  props: Props
  state = {}

  render() {
   const { style, dataSource, isFixed, columns, ...rest } = this.props;

  return (
    <div style={{ ...style }} {...rest}>
      {(!Array.isArray(dataSource) || !dataSource.length) && !isFixed ? (
        <div style={{ textAlign: 'center', padding: 20, color: black }}>暂无数据</div>
      ) : (
        dataSource.map((item, index) => {
          return <TableRow key={`${JSON.stringify(item)}-${index}-tableRow`} record={item} columns={columns} />;
        })
      )}
    </div>
  );
  }

}

export default TableBody;
