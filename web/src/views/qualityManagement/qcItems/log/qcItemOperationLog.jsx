import React, { Component } from 'react';
import { DatePicker } from 'antd';
import PropTypes from 'prop-types';
import { RestPagingTable, Button, Badge, Tooltip } from 'components';
import moment, { formatUnix, formatToUnix, dayStart, dayEnd, daysAgo, formatDateTime } from 'utils/time';
import { queryQcItemOperationLogs } from 'src/services/knowledgeBase/qcItems';
import { replaceSign } from 'src/constants';
import { fontSub } from 'src/styles/color';

const { RangePicker } = DatePicker;

type Props = {
  viewer: any,
  relay: any,
  form: any,
  match: any,
};

class QcItemOperationLog extends Component {
  props: Props;
  state = {
    loading: false,
    dataSource: [],
    dateRange: [],
    pagination: {},
  };

  componentDidMount() {
    this.setState({
      pagination: {
        current: 1,
      },
      dateRange: [formatToUnix(formatDateTime(daysAgo(30))), formatToUnix(formatDateTime(daysAgo(0)))],
    }, () => {
      const { dateRange } = this.state;
      this.fetchData({ page: 1, size: 10 });
    });
  }

  fetchData = async (params) => {
    const { dateRange } = this.state;
    const { match: { params: { id } } } = this.props;
    const { data } = await queryQcItemOperationLogs({ id, fromAt: dateRange[0], toAt: dateRange[1], ...params });
    this.setState({
      dataSource: data.data,
      loading: false,
      pagination: {
        total: data.total,
        current: data.page,
      },
    });
  }

  getColumns = () => {
    const columns = [{
      title: '操作时间',
      dataIndex: 'createdAt',
      width: 150,
      render: (text, record) => <div>{formatUnix(text)}</div>,
    }, {
      title: '操作用户',
      dataIndex: 'userName',
      width: 150,
      render: (text, record) => <Tooltip length={13} text={text} />,
    }, {
      title: '操作类型',
      dataIndex: 'operationType',
      width: 130,
      render: (type, record) => {
        let display = '';
        if (type === 0) {
          display = '创建质检方案';
        }
        if (type === 1) {
          display = '编辑质检方案';
        }
        if (type === 2) {
          display = '删除质检方案';
        }
        if (type === 3) {
          display = '导入质检项';
        }
        return <div>{display}</div>;
      },
    }, {
      title: '操作详情',
      dataIndex: 'description',
      width: '45%',
      render: (text, record) => {
        return text ? <Tooltip length={53} text={text} /> : replaceSign;
      },
    }];
    return columns;
  };

  render() {
    const { loading } = this.state;
    const { dataSource } = this.state;
    const columns = this.getColumns();

    return (
      <div id="qc_item_operation_log">
        <div style={{ margin: 20 }}>
          <span style={{ color: fontSub, marginRight: 10 }}>操作时间</span>
          <RangePicker
            style={{ marginRight: 20 }}
            defaultValue={[moment(formatDateTime(daysAgo(30))), moment(formatDateTime(daysAgo(0)))]}
            onChange={(date) => {
              this.setState({
                dateRange: date.length ? [formatToUnix(dayStart(date[0])), formatToUnix(dayEnd(date[1]))] : [],
              });
            }}
          />
          <Button
            icon="search"
            style={{ width: 86, marginRight: 10 }}
            onClick={() => {
              const { dateRange } = this.state;
              this.fetchData({
                page: 1,
                size: 10,
              });
            }}
          >
            查询
          </Button>
        </div>
        <RestPagingTable
          dataSource={dataSource}
          refetch={this.fetchData}
          rowKey={record => record.id}
          columns={columns}
          loading={loading}
          pagination={this.state.pagination}
          bordered
        />
      </div>
    );
  }
}

QcItemOperationLog.contextTypes = {
  router: PropTypes.object,
};

export default QcItemOperationLog;
