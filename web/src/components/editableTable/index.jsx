import React, { Component } from 'react';
import Table from '../table';
import LocalEditableCell from './editableCell';
import { defaultColWidth, getSingleColWidth } from '../pagingTable/config';

export const EditableCell = LocalEditableCell;

/**
 * @api {EditableTable} 表格.
 * @APIGroup EditableTable.
 * @apiParam {Array} dataSource 数据数组.
 * @apiParam {ColumnProps[]} columns 看antd的Table.
 * @apiExample {js} Example usage:
 * <Table
    columns={columns}
    rowKey={record => record.id}
    dataSource={data}
   />
 */

class EditableTable extends Component {
  props: {
    dataSource: any,
    columns: Array<any>,
    rowKey: () => {},
  };

  state = {};

  getColumns = () => {
    return this.props.columns.map(column => {
      const type = column.type;
      let width;
      if (typeof column[width] === 'number') {
        width = column[width];
      } else if (type !== undefined && defaultColWidth[type] !== undefined) {
        width = defaultColWidth[type];
      } else if (typeof column.maxWidth !== 'undefined') {
        width = getSingleColWidth(column.maxWidth);
      } else {
        return column;
      }
      return {
        ...column,
        width,
      };
    });
  };

  render() {
    const { dataSource, ...rest } = this.props;
    return (
      <Table {...rest} bordered dataSource={dataSource} columns={this.getColumns()} />
    );
  }
}

export default EditableTable;
