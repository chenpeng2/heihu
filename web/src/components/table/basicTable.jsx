/**
 * @description: 基础的table。所有的其他table组件应该包含这个组件的功能。这个组件应该没有耦合table之外的功能。
 *
 * @date: 2019/4/1 上午10:09
 */
import React, { Component } from 'react';
import _ from 'lodash';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { injectIntl } from 'react-intl';
import { setColumnConfig } from 'services/account/config';
import { arrayIsEmpty } from 'src/utils/array';
import LocalStorage from 'src/utils/localStorage';
import { changeChineseTemplateToLocale } from 'src/utils/locale/utils';
import { changeTitleLanguage, generateTableConfigs, formatColumnConfigs } from './utils';
import ResizableTitle from './resizableTitle';
import Table from '../table';
import Tooltip from '../tooltip';
import TableAction from '../table/tableAction';
import styles from './styles.scss';
import ColumnConfig, { getTableColumns as filterColumnsForColumnConfig } from './columnConfig';
import DragableBodyRow from './bodyRow';

const _setTableConfig = (key, value) => {
  let newValue = value;
  if (value) {
    const { columnConfigs, ...rest } = value;
    newValue = {
      ...rest,
      columnConfigs: formatColumnConfigs(columnConfigs),
    };
  }
  setColumnConfig({ configKey: key, configValue: JSON.stringify(newValue) });
  if (key) LocalStorage.set(key, newValue);
};

const setTableConfig = _.throttle(_setTableConfig, 500);

const getTableConfig = key => {
  if (key) return LocalStorage.get(key) || undefined;
};

class BaseTable extends Component {
  props: {
    total: ?number,
    onChange: ?Function,
    loading: ?boolean,
    dataSource: [],
    // 用这个属性不能传scroll属性，建议width都传，必须有render
    /**
     * @description 列可以拖拽调整宽度 只有传了width的列可以调整宽度 建议所有列都传width
     *
     * @type {boolean}
     */
    dragable: boolean,
    sortable: Boolean,
    scroll: {},
    columns: [],
    refetch: () => {},
    pagination: any,
    rowSelection: {},
    style: any,
    useColumnConfig: boolean, // 是否启用列配置
    tableUniqueKey: string, // 列配置如果需要在localStorage中存储下来，需要传这个props。而且需要全局唯一
    intl: any, // 国际化
  };

  state = {
    uuid: null,
    loading: false,
    dragIndex: 0,
    columns: [],
    rawColumns: [],
    /*
     * tableConfigs = {
     *   columnConfigs: [] 列配置属性
     *   pageSize: number 表示每页最多几条数据
     * }
     */
    tableConfigs: {},
  };

  componentWillMount() {
    // 填columnConfig初始值
    const { tableUniqueKey, columns: _columns } = this.props;
    const tableConfigsLocalStorage = tableUniqueKey ? getTableConfig(tableUniqueKey) : {};
    const tableConfigs = generateTableConfigs(_columns, tableConfigsLocalStorage);
    if (tableUniqueKey) {
      setTableConfig(tableUniqueKey, tableConfigs);
    }
    const columns = this.getColumns(_columns, tableConfigs);
    this.setState({ tableConfigs, columns, rawColumns: _columns });
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.columns, nextProps.columns)) {
      const { columns: _columns, tableUniqueKey } = nextProps;
      const tableConfigsLocalStorage = tableUniqueKey ? getTableConfig(tableUniqueKey) : {};
      const tableConfigs = generateTableConfigs(_columns, tableConfigsLocalStorage);
      if (tableUniqueKey) {
        setTableConfig(tableUniqueKey, tableConfigs);
      }
      const columns = this.getColumns(_columns, tableConfigs);
      this.setState({ tableConfigs, columns, rawColumns: nextProps.columns });
    }
  }

  getComponents = () => {
    const components = {};
    if (this.props.dragable) {
      components.header = {
        cell: ResizableTitle,
      };
    }
    if (this.props.sortable) {
      components.body = {
        row: DragableBodyRow,
      };
    }

    return components;
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { sortable, onMoveRow } = this.props;
    if (!sortable) {
      return;
    }
    if (typeof onMoveRow === 'function') {
      onMoveRow(dragIndex, hoverIndex);
    }

    // this.setState(
    //   update(this.state, {
    //     data: {
    //       $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
    //     },
    //   }),
    // );
  };

  // 当点击不同的页码的时候，handleTableChange的pagination就是正确的pagination
  handleTableChange = (pagination, filters, sorter) => {
    const { onChange, refetch, tableUniqueKey } = this.props;
    // this.setState({ loading: true });
    const { tableConfigs } = this.state;
    const newTableConfigs = {
      ...tableConfigs,
      pageSize: pagination && pagination.pageSize,
    };
    this.setState({ tableConfigs: newTableConfigs });
    if (tableUniqueKey) {
      setTableConfig(tableUniqueKey, newTableConfigs);
    }

    if (onChange) {
      onChange(pagination, filters, sorter);
    } else if (typeof refetch === 'function') {
      const variables = { page: pagination.current, size: pagination.pageSize };
      refetch(variables);
    }

    // this.setState({ loading: false });
  };

  getResizableRender = col => {
    return (data, record, index) => {
      let content = '';
      if (typeof col.baseRender === 'function') {
        content = col.baseRender(data, record, index);
      }
      if (col.width && typeof content === 'string') {
        return <Tooltip text={content} width={col.width - 20} />;
      }
      return content;
    };
  };

  handleResize = index => (e, { size }) => {
    this.setState(({ columns }) => {
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      nextColumns[index] = {
        ...nextColumns[index],
        render: this.getResizableRender(nextColumns[index]),
      };
      return { columns: nextColumns };
    });
  };

  handleResizeStop = index => (e, { size }) => {
    const { tableUniqueKey } = this.props;
    const { tableConfigs } = this.state;
    const columnConfigs = _.get(tableConfigs, 'columnConfigs') || [];

    const newColumnConfigs = [...columnConfigs];
    newColumnConfigs[index] = {
      ...newColumnConfigs[index],
      width: size.width,
    };
    const newTableConfigs = {
      ...tableConfigs,
      columnConfigs: newColumnConfigs,
    };
    this.setState({ tableConfigs: newTableConfigs });
    if (tableUniqueKey) {
      setTableConfig(tableUniqueKey, newTableConfigs);
    }
  };

  getColumns = (rawColumns = [], tableConfigs = {}) => {
    const { useColumnConfig, dragable } = this.props;
    const { columnConfigs } = tableConfigs;
    const defaultRender = text => text;

    // 国际化替换title
    let _columns = rawColumns.map((e, index) => ({
      ...e,
      baseWidth: e.width,
      baseRender: e.render || defaultRender,
      baseIndex: index,
    }));
    if (useColumnConfig) {
      _columns = filterColumnsForColumnConfig(_columns, columnConfigs);
    }

    // 处理dragable
    if (dragable) {
      _columns = _columns.map((col, index) => ({
        ...col,
        render: this.getResizableRender(col),
        onHeaderCell: column => {
          const { width, fixed, baseWidth, baseIndex } = column;
          return {
            className: 'resizable-table-header',
            fixed,
            resizableProps: {
              onResize: this.handleResize(index),
              onResizeStop: this.handleResizeStop(baseIndex),
              minConstraints: [baseWidth, 10],
              width,
              axis: 'x',
            },
          };
        },
      }));
    }
    return _columns;
  };

  render() {
    const { loading, rawColumns, tableConfigs } = this.state;
    let { columns } = this.state;

    const {
      tableUniqueKey,
      useColumnConfig,
      scroll,
      style,
      total,
      dragable,
      pagination,
      columns: _columns,
      intl,
      ...rest
    } = this.props;
    const _pagination =
      pagination === false
        ? false
        : {
            showSizeChanger: true,
            showTotal: total => changeChineseTemplateToLocale('共{amount}条结果', { amount: total || 0 }, intl),
            showQuickJumper: true,
            total,
            pageSizeOptions: ['10', '20', '50', '100'],
            ...pagination,
          };

    const styleMargin = style ? style.margin : null;

    // 国际化
    if (tableConfigs && !arrayIsEmpty(tableConfigs.columnConfigs)) {
      tableConfigs.columnConfigs = changeTitleLanguage(tableConfigs.columnConfigs, intl);
    }
    if (!arrayIsEmpty(columns)) {
      columns = changeTitleLanguage(columns, intl);
    }

    return (
      <div style={{ position: 'relative' }}>
        {tableUniqueKey && useColumnConfig ? (
          <ColumnConfig
            tableUniqueKey={tableUniqueKey}
            columnConfigs={tableConfigs && tableConfigs.columnConfigs}
            style={{ position: 'absolute', right: 20, top: -48 }} // 按钮为绝对定位 与table本身的间隔为20px 按钮高度28px。
            columns={rawColumns}
            cbForChange={columnConfigs => {
              const { tableConfigs, rawColumns } = this.state;
              const newTableConfigs = {
                ...tableConfigs,
                columnConfigs,
              };
              const newColumns = this.getColumns(rawColumns, newTableConfigs);
              this.setState({
                columns: newColumns,
                tableConfigs: newTableConfigs,
              });
              if (tableUniqueKey) {
                setTableConfig(tableUniqueKey, newTableConfigs);
              }
            }}
          />
        ) : null}
        <Table
          loading={loading}
          scroll={{ x: dragable ? true : undefined, ...scroll }}
          style={style}
          pagination={_pagination}
          components={this.getComponents()}
          columns={columns}
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow,
          })}
          {...rest}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

BaseTable.TableAction = TableAction;

export default DragDropContext(HTML5Backend)(injectIntl(BaseTable));
