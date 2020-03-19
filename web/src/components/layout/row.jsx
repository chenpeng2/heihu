import React, { Component } from 'react';
import { Row as AntRow } from 'antd';
import styles from './styles.scss';

type Props = {
  children: React.ReactNode,
  style: Object,
};

class Row extends Component {
  props: Props;

  state = {};

  render() {
    const { children, style } = this.props;

    return (
      <div className={styles.row} style={{ ...style }}>
        {children}
      </div>
    );
  }
}

Row.AntRow = AntRow;

export default Row;
