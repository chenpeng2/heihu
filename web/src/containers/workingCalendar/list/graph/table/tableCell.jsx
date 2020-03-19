import React, { Component } from 'react';

import styles from './styles.scss';

type Props = {
  style: {},
  column: {},
  record: {},
  className: string,
};

const TableCell = (props: Props) => {
    const { column, record, style, className } = props;

    const { key, width, render, style: columnStyle } = column;

    const data = record && key ? record[key] : null;

    return (
      <div
        style={{ width, ...style, ...columnStyle }}
        className={`${styles.tableCell} ${className}`}
      >
        { typeof render === 'function' ? render(data, record) : null}
      </div>
    );
};

export default TableCell;
