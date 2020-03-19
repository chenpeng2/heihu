import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import classNames from 'classnames';
import styles from './styles.scss';
import TableAction from './tableAction';

/**
 * @api {Table} 表格.
 * @APIGroup Table.
 * @apiParam {String} highLightRowId 设置要高亮的row的id.
 * @apiParam {Boolean} bordered 如为true的话每隔一行设置rowClassName={'myTableRowBordered'}.
 * @apiExample {js} Example usage:
 * <Table bordered dataSource={dataSource} columns={columns} {...rest} highLightRowId={'abcd'}/>
 * 其他属性见antd的table
 */

class MyTable extends Component {
  state = {};

  render() {
    const { highLightRowId, bordered, style, tableStyle, className, ...rest } = this.props;

    return (
      <div className={classNames(styles.tableContainer, className)} style={style}>
        <Table
          style={{ position: 'relative', ...tableStyle }}
          rowClassName={record => {
            if (record.id !== undefined && highLightRowId === record.id) {
              return 'myTableHighLightRow';
            }
            return null;
          }}
          {...rest}
        />
      </div>
    );
  }
}

MyTable.propTypes = {
  ...Table.propTypes,
  bordered: PropTypes.bool,
  highLightRowId: PropTypes.string,
};

MyTable.TableAction = TableAction;
MyTable.AntTable = Table;

export default MyTable;
