import React, { Component } from 'react';
import _ from 'lodash';
import { Icon, Link, message } from 'components';

import Table from './basicTable';

type Props = {
  columns: [],
  dataSource: [],
  style: {},
  // handleAdd: () => {}, // 自己处理添加逻辑
  itemName: string, // 添加项名称
  dataSource: [],
  setDataSource: () => {},
  atLeastNum: Number, // 至少有多少行
  maxNum: Number, // 最多有多少行
  form: any,
  fieldName: String,
  orderable: boolean, // 是否支持调换顺序
};

/**
 * 暂时是只做了基础的一些功能，后续有时间完善
 * setDataSource用于设置datasource
 * 如果datasource作为表单提交的话，要过滤一下empty的项 ex: [{ name: '111' }, empty, { name: '222' }]
 */

class AlterableTable extends Component {
  props: Props;
  state = {
    count: 0,
    data: [],
  };

  componentDidMount = () => {
    const { dataSource } = this.props;
    this.setInitialData(dataSource);
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    if (!_.isEqual(nextProps.dataSource, this.props.dataSource)) {
      this.setInitialData(nextProps.dataSource);
    }
    return true;
  };

  setInitialData = data => {
    let _dataSource = [];
    const { atLeastNum } = this.props;
    if (data && data.length > 0) {
      _dataSource =
        data &&
        data.map((x, i) => {
          return {
            key: i,
            ...x,
          };
        });
    } else if (typeof atLeastNum === 'number') {
      for (let i = 0; i < atLeastNum; i += 1) {
        _dataSource.push({
          key: i,
        });
      }
      console.log({ _dataSource });
    }
    this.onDataSourceChange(_dataSource);
  };

  scrollToBottom = () => {
    const wrapper = document.getElementById(this.props.fieldName);
    if (wrapper) {
      const dom = wrapper.getElementsByClassName('ant-table-body')[0];
      if (dom) {
        dom.scrollTop = dom.scrollHeight;
      }
    }
  };

  onDataSourceChange = data => {
    const { setDataSource } = this.props;

    if (typeof setDataSource === 'function') {
      setDataSource(data);
      setTimeout(() => {
        this.scrollToBottom();
      }, 500);
    }
  };

  deleteColumn = k => {
    const { dataSource } = this.props;
    const _dataSource = dataSource && dataSource.filter(({ key }) => key !== k);
    this.onDataSourceChange(_dataSource);
  };

  getColumns = () => {
    let _columns;
    const { columns, orderable } = this.props;
    const fixedLeft = _.filter(columns, x => x && x.fixed === 'left');
    const col = {
      width: 30,
      fixed: fixedLeft && fixedLeft.length > 0 ? 'left' : null,
      render: (text, record, index) => {
        const {
          key,
          deletable, // 是否可删除
          cantDeleteMsg,
        } = record;
        const { atLeastNum, dataSource } = this.props;
        const checkLeastNumOK = typeof atLeastNum === 'number' ? _.get(dataSource, 'length') > atLeastNum : true;

        return (
          <Icon
            onClick={() => {
              if (cantDeleteMsg) {
                message.error(cantDeleteMsg);
              }
              if ((!_.isUndefined(deletable) && deletable) || (_.isUndefined(deletable) && checkLeastNumOK)) {
                this.deleteColumn(key);
              }
            }}
            style={{
              height: 40,
              lineHeight: '40px',
              marginBottom: 10,
              cursor: 'pointer',
            }}
            type="minus-circle"
          />
        );
      },
    };
    const orderableCol = {
      title: '操作',
      key: 'action',
      width: 65,
      fixed: 'right',
      render: (data, record, i) => {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer' }}>
            <Icon
              style={{ height: 16, padding: 0, opacity: i !== 0 ? 1 : 0.3 }}
              iconType="gc"
              type="arrow-up"
              onClick={() => (i !== 0 ? this.changeOrder(i, 'upward') : null)}
            />
            <Icon
              style={{ height: 16, padding: 0, opacity: i + 1 !== this.props.dataSource.length ? 1 : 0.3 }}
              iconType="gc"
              type="arrow-down"
              onClick={() => (i + 1 !== this.props.dataSource.length ? this.changeOrder(i, 'downward') : null)}
            />
          </div>
        );
      },
    };

    if (Array.isArray(columns)) {
      _columns = _.concat(col, columns);
    }

    if (orderable) {
      _columns = _.concat(_columns, orderableCol);
    }

    return _columns;
  };

  addColumn = () => {
    const { dataSource } = this.props;
    const lastKey = _.last(dataSource) ? _.last(dataSource).key : -1;
    this.onDataSourceChange(
      dataSource.concat({
        key: lastKey + 1,
      }),
    );
  };

  getFooter = itemName => {
    const { dataSource, maxNum } = this.props;
    const disabled = _.get(dataSource, 'length') === maxNum;

    return (
      <Link icon="plus-circle-o" onClick={() => this.addColumn()} disabled={disabled}>
        {`添加${itemName || '一行'}`}
      </Link>
    );
  };

  exchange = (origin, target) => {
    const { dataSource } = this.props;
    if (dataSource && dataSource.length < 2) return;

    const o = dataSource[origin];
    const t = dataSource[target];

    // 交换表单的值
    dataSource[origin] = t;
    dataSource[target] = o;

    this.props.setDataSource(dataSource);
  };

  changeOrder = (index, direction) => {
    const { dataSource } = this.props;
    if (dataSource && dataSource.length <= 1) return;

    let t;

    if (direction === 'upward') {
      t = index - 1; // 目标index
      if (index === 0) t = dataSource.length - 1;
      this.exchange(index, t);
    }
    if (direction === 'downward') {
      t = index + 1; // 目标index
      if (index === dataSource.length - 1) t = 0;
      this.exchange(index, t);
    }
  };

  render() {
    const { columns, itemName, style, dataSource, fieldName, ...rest } = this.props;
    const { count, data } = this.state;

    return (
      <div
        style={{
          marginLeft: '-20px',
        }}
      >
        <Table
          id={fieldName}
          pagination={false}
          columns={this.getColumns(columns)}
          total={count}
          rowKey={record => record.key}
          footer={() => this.getFooter(itemName)}
          style={{
            minWidth: 700,
            ...style,
          }}
          dataSource={dataSource}
          {...rest}
        />{' '}
      </div>
    );
  }
}
AlterableTable.contextTypes = {
  changeChineseToLocale: () => {},
};

export default AlterableTable;
