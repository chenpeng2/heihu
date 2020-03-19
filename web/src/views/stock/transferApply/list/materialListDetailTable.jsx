import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Table, Icon, Popover, Spin, Badge, Tooltip } from 'src/components/index';
import { getMaterialListDetail } from 'src/services/cooperate/materialRequest';
import log from 'src/utils/log';
import { replaceSign } from 'src/constants';
import { black, primary } from 'src/styles/color/index';

import LinkToEditPage from '../baseComponent/linkToEditPage';
import { findExecuteStatus, APPLY_STATUS } from '../util';
import ExecuteTimeline from './executeTimeline';
import OperationHistoryTimeline from './operationHistoryTimeline';

class MaterialListDetailTable extends Component {
  state = {
    loading: false,
    data: [],
  };

  componentDidMount() {
    const id = _.get(this.props, 'data.id');
    this.fetchAndSetData(id);
  }

  fetchAndSetData = async headerId => {
    this.setState({ loading: true });

    try {
      const res = await getMaterialListDetail({ headerId });
      const data = _.get(res, 'data.data');
      this.setState({ data });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  getColumns = () => {
    return [
      {
        title: '编号',
        dataIndex: 'lineId',
        width: 100,
        render: data => {
          return <span>{data}</span>;
        },
      },
      {
        title: '物料编号/名称',
        key: 'material',
        width: 200,
        render: (__, record) => {
          const { materialCode, materialName } = record || {};
          const text = materialCode && materialName ? `${materialCode}/${materialName}` : replaceSign;

          return <Tooltip text={text} length={12} />;
        },
      },
      {
        title: '发出进度',
        key: 'sendProgress',
        width: 200,
        render: (__, record) => {
          const { sendingAmount, planingAmount, materialUnit } = record || {};
          const text = `${sendingAmount} / ${planingAmount} ${materialUnit}`;

          return (
            <Popover content={<ExecuteTimeline key={Math.random()} data={record} />}>
              <span style={{ cursor: 'pointer', color: primary }}>{text}</span>
            </Popover>
          );
        },
      },
      {
        title: '接收进度',
        key: 'receiveProgress',
        width: 200,
        render: (__, record) => {
          const { receiveAmount, planingAmount, materialUnit } = record || {};
          const text = `${receiveAmount} / ${planingAmount} ${materialUnit}`;

          return (
            <Popover content={<ExecuteTimeline key={Math.random()} data={record} />}>
              <span style={{ cursor: 'pointer', color: primary }}>{text}</span>
            </Popover>
          );
        },
      },
      {
        title: '可用库存',
        dataIndex: 'availableAmount',
        width: 200,
        render: text => <span>{text}</span>,
      },
      {
        title: '状态',
        width: 200,
        dataIndex: 'status',
        render: data => {
          const { name, color } = findExecuteStatus(data) || {};

          return <Badge.MyBadge text={name} color={color} />;
        },
      },
      {
        title: '行备注',
        width: 200,
        dataIndex: 'remark',
        render: data => {
          return <Tooltip text={data || replaceSign} length={12} />;
        },
      },
    ];
  };

  render() {
    const { data } = this.props;
    const { changeChineseToLocale } = this.context;
    const { code, id, status } = data || {};

    return (
      <Spin spinning={this.state.loading}>
        <div>
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: black, fontSize: 14 }}>
              {changeChineseToLocale('转移申请编号')}：{code}
            </div>
            <div>
              {status === APPLY_STATUS.created.value ? <LinkToEditPage withIcon id={id} /> : null}
              <div style={{ marginLeft: 10, display: 'inline-block' }}>
                <Popover placement={'leftTop'} content={<OperationHistoryTimeline key={Math.random()} data={data} />}>
                  <div style={{ color: primary, cursor: 'pointer' }}>
                    <Icon style={{ marginRight: 5 }} type={'eye'} />
                    <span>{changeChineseToLocale('操作历史记录')}</span>
                  </div>
                </Popover>
              </div>
            </div>
          </div>
          <Table
            style={{ margin: 0 }}
            scroll={{ x: 1000 }}
            columns={this.getColumns()}
            dataSource={this.state.data}
            pagination={false}
          />
        </div>
      </Spin>
    );
  }
}

MaterialListDetailTable.propTypes = {
  style: PropTypes.object,
  data: PropTypes.string,
};

MaterialListDetailTable.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default MaterialListDetailTable;
