import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import { withRouter } from 'react-router-dom';
import { injectIntl } from 'react-intl';

import { setLocation } from 'src/utils/url';
import { getPathname, getQuery, getState } from 'src/routes/getRouteParams';
import { DEFAULT_PAGE_SIZE } from 'src/constants';
import LocalStorage from 'src/utils/localStorage';
import { arrayIsEmpty } from 'src/utils/array';
import { changeChineseTemplateToLocale } from 'src/utils/locale/utils';

import { defaultColWidth, getSingleColWidth } from './config';
import Table from '../table';
import Tooltip from '../tooltip';
import TableAction from '../table/tableAction';
import styles from './styles.scss';
import ColumnConfig, { getTableColumns as filterColumnsForColumnConfig } from './columnConfig';
import { changeTitleLanguage } from '../table/utils';

const saveColumnConfig = (key, value) => {
  if (key) LocalStorage.set(key, value);
};

const getColumnConfig = key => {
  if (key) return LocalStorage.get(key) || null;
};

class PagingTable extends Component {
  props: {
    total: ?number,
    onChange: ?Function,
    loading: ?boolean,
    dataSource: [],
    push: () => {},
    router: {},
    scroll: {},
    match: {},
    columns: [],
    refetch: () => {},
    // 用这个属性不能传scroll属性，建议width都传，必须有render
    dragable: boolean,
    rowSelection: {},
    pageSize: number,
    style: any,
    showPageSizeChanger: boolean,
    showQuickJumper: boolean,
    showTotalAmount: boolean,
    useColumnConfig: boolean, // 是否启用列配置
    columnsConfigLocalStorageKey: string, // 列配置如果需要在localStorage中存储下来，需要传这个props。而且不同的table需要是不同的
    intl: any, // 国际化
  };

  state = {
    uuid: null,
    activeTab: document,
    loading: false,
    pagination: {
      current: 1,
      total: 0,
      pageSize: DEFAULT_PAGE_SIZE,
    },
    dragging: false,
    offsetX: 0,
    widthArr: [],
    dragIndex: 0,
    columnConfigs: [],
  };

  componentWillMount() {
    const pagination = this.getPagination(this.props);
    this.setState({ pagination, uuid: _.uniqueId('table_') });
  }

  componentDidMount() {
    // 填columnConfig初始值
    const { columnsConfigLocalStorageKey } = this.props;
    if (columnsConfigLocalStorageKey) {
      this.setState({ columnConfigs: getColumnConfig(columnsConfigLocalStorageKey) });
    }
  }

  // 当filter和search等对页面造成了更新后，需要重新seaState
  componentWillReceiveProps(nextProps) {
    const pagination = this.getPagination(nextProps);
    const { dragable } = this.props;
    const { uuid } = this.state;
    if (dragable) {
      const activeTab = document.getElementById(uuid);
      activeTab.onmousemove = this.move;
      activeTab.onmouseup = this.up;
      const tableHead = activeTab.getElementsByClassName('ant-table-thead')[0];
      const ths = tableHead.childNodes[0].childNodes;
      const widthArr = Array.from(ths).map(n => n.offsetWidth);
      if (this.props.rowSelection) {
        widthArr.splice(0, 1);
      }
      this.setState({ widthArr, activeTab });
    }
    this.setState({
      pagination,
    });
  }

  down = (e, index) => {
    const { activeTab } = this.state;
    const line = activeTab.getElementsByClassName('dragableLine___FTfot');
    this.setState({ dragging: true });
    const lineX = line[index].offsetLeft;
    const mouseX = parseInt(this.getMouseX(e), 10);
    const offsetX = mouseX - lineX;
    this.setState({ offsetX });
  };

  move = e => {
    const { widthArr, dragIndex, activeTab } = this.state;
    const { columns } = this.props;
    const line = activeTab.getElementsByClassName('dragableLine___FTfot');
    if (this.state.dragging) {
      const x = columns.map(n => Math.max(this.getMouseX(e) - this.state.offsetX, n.width || 150));
      widthArr[dragIndex] = x[dragIndex];
      this.setState({ widthArr });
      line[dragIndex].style.left = `${x}px`;
    }
  };

  up = () => {
    this.setState({ dragging: false });
  };

  getMouseX = e => {
    e = e || window.event;
    const x = e.pageX;
    return x;
  };

  getPagination = props => {
    const { match, total, dataSource, pagination: paginationFromProps, pageSize } = props || this.props;

    // 外部传入 pagination=false 表示无分页
    if (paginationFromProps !== undefined) {
      return paginationFromProps;
    }

    const query = getQuery(match);
    const { page, pageSize: urlPageSize } = query || {};

    return {
      current: page || 1,
      total: total || (dataSource && dataSource.length) || 0,
      pageSize: pageSize || urlPageSize || DEFAULT_PAGE_SIZE,
    };
  };

  // 当点击不同的页码的时候，handleTableChange的pagination就是正确的pagination
  handleTableChange = (pagination, filters, sorter) => {
    const { onChange, match, refetch } = this.props;
    this.setState({ loading: true });

    const query = getQuery(match);
    const pathname = getPathname(match);
    const state = getState(match);
    const variables = { ...query, page: pagination.current, pageSize: pagination.pageSize };

    // 当table的onChange事件触发的时候，将page的信息放入url中是这个组件必须要做的。
    // setVariables(null, null, pathname, variables, null, state);
    setLocation(this.props, p => ({ ...p, ...variables }));

    if (onChange) {
      // 如果传入了onChange，就必须要在onChange中负责数据的拉取。这个组件不处理这个是为了防止将onChange中的数据拉取覆盖。
      // TODO:bai 这样实现对antd的onChange的api做了改动，是一个好的行为吗？
      onChange(pagination, filters, sorter, variables);
    } else {
      // 虽然将refetch先执行先拉取数据是可行的。但是会多一次网络请求
      refetch(variables);
    }

    this.setState({ loading: false });
  };

  getKey = () => {
    const { pagination } = this.state;
    const key = `${pagination && pagination.current}-${this.props.total}`;
    return key;
  };

  getColumns = baseColumns => {
    const { intl } = this.props;
    // 国际化替换title
    const columns = baseColumns;
    return Array.isArray(columns) && columns.length
      ? columns.map((_column, index) => {
          // const column = _.cloneDeep(_column);
          const column = _column;
          const type = column.type;
          let width;
          if (this.props.dragable) {
            width = this.state.widthArr[index] || column.width;
            if (column && column.title) {
              if (index !== this.props.columns.length - 1) {
                column.title = (
                  <div>
                    {column.title}
                    <span
                      id={'DRAGLINE'}
                      className={classNames(styles.dragableLine)}
                      onMouseDown={e => {
                        this.down(e, index);
                        this.setState({ dragIndex: index });
                      }}
                    />
                  </div>
                );
              }
              const _render = column.render;
              column.render = (data, record) => {
                const content = _render(data, record);
                if (typeof content === 'string') {
                  return <Tooltip text={content} width={this.state.widthArr[index] - 20} />;
                }
                return content;
              };
            }
          } else if (type !== undefined && defaultColWidth[type] !== undefined) {
            width = defaultColWidth[type];
          } else if (typeof column.maxWidth !== 'undefined') {
            width = getSingleColWidth(column.maxWidth);
          } else if (typeof column.width === 'number') {
            width = column.width;
          } else {
            return column;
          }
          return {
            ...column,
            width,
          };
        })
      : [];
  };

  // 为列配置过滤
  getFilterColumnsForColumnConfig = () => {
    const { columns } = this.props;
    const { columnConfigs } = this.state;
    const baseColumns = filterColumnsForColumnConfig(columns, columnConfigs);
    const _columns = this.getColumns(baseColumns);
    return _columns;
  };

  render() {
    const { pagination, uuid } = this.state;
    const {
      columnsConfigLocalStorageKey,
      useColumnConfig,
      scroll,
      showPageSizeChanger,
      showQuickJumper,
      style,
      showTotalAmount,
      columns,
      intl,
      ...rest
    } = this.props;

    const styleMargin = style ? style.margin : null;

    const changePagination = () => {
      if (!pagination) return false;

      return {
        ...pagination,
        pageSizeOptions: ['10', '20', '50', '100'],
        showSizeChanger: showPageSizeChanger,
        showQuickJumper,
      };
    };
    const newPagination = changePagination();
    let _columns = useColumnConfig ? this.getFilterColumnsForColumnConfig() : this.getColumns(columns);

    // 国际化
    _columns = !arrayIsEmpty(_columns) ? changeTitleLanguage(_columns, intl) : _columns;

    return (
      <div id={uuid} style={{ position: 'relative' }}>
        {useColumnConfig ? (
          <ColumnConfig
            initialValue={columnsConfigLocalStorageKey ? getColumnConfig(columnsConfigLocalStorageKey) : null}
            style={{ position: 'absolute', right: 20, top: -48 }} // 按钮为绝对定位 与table本身的间隔为20px 按钮高度28px。
            columns={!arrayIsEmpty(columns) ? changeTitleLanguage(columns, intl) : columns}
            cbForChange={value => {
              this.setState({ columnConfigs: value });
              if (columnsConfigLocalStorageKey) {
                saveColumnConfig(columnsConfigLocalStorageKey, value);
              }
            }}
          />
        ) : null}
        <Table
          loading={this.state.loading}
          key={this.getKey()}
          scroll={{ x: true, ...scroll }}
          style={style}
          {...rest}
          onChange={this.handleTableChange}
          columns={_columns}
          pagination={newPagination}
        />
        {showTotalAmount ? (
          <div style={{ padding: '10px 0px', overflow: 'hidden' }}>
            <span style={{ float: 'left', margin: styleMargin !== null ? styleMargin : '0px 0px 0px 20px' }}>
              {changeChineseTemplateToLocale('共{amount}条结果', { amount: pagination.total || 0 }, intl)}
            </span>
          </div>
        ) : null}
      </div>
    );
  }
}

PagingTable.contextTypes = {
  router: PropTypes.object.isRequired,
};

PagingTable.TableAction = TableAction;

export default withRouter(injectIntl(PagingTable));
