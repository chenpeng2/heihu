import React, { Component } from 'react';
import classNames from 'classnames';
import styles from './index.scss';

class RowLayout extends Component {
  props: {
    children: Element,
    className: string,
    style: any,
  };
  state = {};

  render() {
    const { style, className } = this.props;
    return (
      <div style={style} className={classNames(styles.parent, className)}>
        {this.props.children}
      </div>
    );
  }
}

export default RowLayout;
