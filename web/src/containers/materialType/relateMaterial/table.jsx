import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Table as BasicTable, Tooltip } from 'src/components';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'src/utils/array';

class Table extends Component {
  state = {
    selectedRows: [],
  };

  getColumns = () => {
    return [
      {
        title: '物料编号',
        dataIndex: 'code',
        width: 150,
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
      {
        title: '物料名称',
        dataIndex: 'name',
        width: 150,
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
      {
        title: '物料类型',
        key: 'materialTypes',
        dataIndex: 'materialTypes',
        width: 150,
        render: materialTypes => {
          const text =
            Array.isArray(materialTypes) && materialTypes.length
              ? materialTypes.map(e => e.name).join(',')
              : replaceSign;
          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '规格描述',
        dataIndex: 'desc',
        render: data => {
          return <Tooltip text={data || replaceSign} length={30} />;
        },
      },
    ];
  };

  getRowSelection = () => {
    const { cbForSelect, data, materialTypeId } = this.props;

    return {
      onChange: (selectedRowKeys, selectedRows) => {
        const { selectedRows: _selectedRows } = this.state;
        const newSelectedRows = _.pullAllBy(_selectedRows, data, 'code').concat(selectedRows);
        this.setState({ selectedRows: newSelectedRows, selectedRowKeys }, () => {
          if (typeof cbForSelect === 'function') cbForSelect(newSelectedRows);
        });
      },
      selectedRowKeys: this.state.selectedRowKeys,
      getCheckboxProps: record => {
        const { materialTypes } = record || {};
        const materialTypeIds = arrayIsEmpty(materialTypes) ? [] : materialTypes.map(i => i && i.id).filter(i => i);

        // 已经关联过这个物料类型的物料不可以再次关联
        let disabled = false;
        if (materialTypeId) disabled = materialTypeIds.includes(Number(materialTypeId));

        return {
          disabled,
        };
      },
    };
  };

  render() {
    const { data, refetch, pagination } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    const { selectedRowKeys } = this.state;
    const columns = this.getColumns();

    const _data = data.map(i => {
      if (i) {
        i.key = i.code;
      }
      return i;
    });

    return (
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <span>
            {changeChineseTemplateToLocale('已选{amount}条', {
              amount: arrayIsEmpty(selectedRowKeys) ? 0 : selectedRowKeys.length,
            })}
          </span>
        </div>
        <BasicTable
          style={{ margin: 0 }}
          scroll={{ y: 200 }}
          columns={columns}
          dataSource={_data || []}
          rowSelection={this.getRowSelection()}
          onChange={pagination => {
            const { current, pageSize } = pagination;
            if (typeof refetch === 'function') {
              refetch({ page: current, size: pageSize });
            }
          }}
          pagination={{
            ...pagination,
            pageSizeOptions: ['10', '20', '50', '100', '200', '500'],
          }}
        />
      </div>
    );
  }
}

Table.propTypes = {
  style: PropTypes.object,
  data: PropTypes.array,
  refetch: PropTypes.func,
  cbForSelect: PropTypes.func,
  pagination: PropTypes.any,
  materialTypeId: PropTypes.any,
};

Table.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default Table;
