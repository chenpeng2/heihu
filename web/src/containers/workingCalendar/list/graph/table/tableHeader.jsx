import React, { Component } from 'react';

import styles from './styles.scss';

type Props = {
  style: {},
  className: string,
  columns: [],
};

class TableHeader extends Component {
  props: Props;
  state = {};

  render() {
    const { columns, style, className, ...rest } = this.props;

    return (
      <div style={{ ...style }} className={`${styles.tableRow} ${className} `} {...rest}>
        {Array.isArray(columns)
          ? columns.map((item, index) => {
              const { title, width, renderTitle, style: columnStyle } = item || {};

              return (
                <div className={styles.tableHeaderCell} style={{ width, ...columnStyle }} key={`${JSON.stringify(item)}-header-${index}`} >
                  {typeof renderTitle === 'function' ? renderTitle(title) : null}
                </div>
              );
            })
          : null}
      </div>
    );
  }
}

export default TableHeader;
