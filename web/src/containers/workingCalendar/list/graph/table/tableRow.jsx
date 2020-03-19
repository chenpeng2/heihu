import React, { Component } from 'react';

import TableCell from './tableCell';
import styles from './styles.scss';

type Props = {
  style: {},
  columns: [],
  record: {},
  className: string,
};

const TableRow = (props: Props) => {
  const { columns, record, className, style, ...rest } = props;

  return (
    <div className={`${className} ${styles.tableRow}`} style={style} {...rest}>
      {Array.isArray(columns)
        ? columns.map((item, index) => {
            return <TableCell key={`${JSON.stringify(item)}-${index}-tableCell`} record={record} column={item} />;
          })
        : null}
    </div>
  );
};

export default TableRow;
