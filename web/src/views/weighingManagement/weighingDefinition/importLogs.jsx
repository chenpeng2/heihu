import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Spin, DatePicker, withForm, Button, Icon, Table, Badge, Link, PlainText } from 'components';
import { getQuery } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { middleGrey } from 'src/styles/color';
import moment, { formatUnix, formatToUnix, dayStart, dayEnd } from 'utils/time';
import { queryWeighingDefinitionImportLogs } from 'services/weighing/weighingDefinition';
import { toWeighingDefinitionImportDetail } from '../navigation';

const { RangePicker } = DatePicker;

type Props = {
  form: {
    validateFields: () => {},
  },
};

class WeighingDefinitionImportLogs extends Component {
  props: Props;
  state = {
    total: 0,
    dataSource: [],
    loading: false,
    pagination: {},
  };

  componentDidMount() {
    this.onSearch();
  }

  getColumns = () => {
    return [
      {
        title: '导入时间',
        dataIndex: 'createdAt',
        width: 200,
        render: text => formatUnix(text),
      },
      {
        title: '导入用户',
        dataIndex: 'userName',
        width: 160,
      },
      {
        title: '导入结果',
        width: 160,
        render: record => {
          if (record.failureAmount === 0) {
            return <Badge status="success" text="导入成功" />;
          } else if (record.successAmount === 0) {
            return <Badge status="error" text="导入失败" />;
          }
          return <Badge status="warning" text="部分导入成功" />;
        },
      },
      {
        title: '导入详情',
        render: record => (
          <div>
            称量定义导入完成！成功数：{record.successAmount}，失败数：{record.failureAmount}。
          </div>
        ),
      },
      {
        title: '操作',
        dataIndex: 'importId',
        width: 120,
        render: (importId, record) => (
          <Link style={{ marginRight: 20 }} to={toWeighingDefinitionImportDetail({ importId })}>
            查看
          </Link>
        ),
      },
    ];
  };

  fetchData = async params => {
    this.setState({ loading: true });
    const {
      match: {
        params: { id },
      },
      match,
    } = this.props;
    const query = getQuery(match);
    const _params = { ...query, ...params };
    const { page, size } = _params;
    setLocation(this.props, p => _params);
    const {
      data: { data, count },
    } = await queryWeighingDefinitionImportLogs({ ...params, size: 10 });
    this.setState({
      dataSource: data,
      total: count,
      loading: false,
      pagination: { current: page, pageSize: size, total: count },
    });
  };

  onSearch = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { dates, ...rest } = values;
        const from_at = dates[0] && formatToUnix(dayStart(dates[0]));
        const to_at = dates[1] && formatToUnix(dayEnd(dates[1]));
        this.fetchData({ from_at, to_at, page: 1, ...rest });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { dataSource, total, loading, pagination } = this.state;
    const columns = this.getColumns();
    const lastMonth = moment().subtract(1, 'months');
    const today = moment();

    return (
      <Spin spinning={loading}>
        <div style={{ display: 'flex', alignItems: 'center', margin: 20 }}>
          <PlainText style={{ color: middleGrey, fontSize: 14 }} text="导入时间" />
          <div style={{ marginLeft: 10 }}>
            {getFieldDecorator('dates', {
              initialValue: [lastMonth, today],
            })(<RangePicker />)}
          </div>
          <Button icon="search" style={{ width: 86, marginLeft: 10 }} onClick={this.onSearch}>
            查询
          </Button>
        </div>
        <Table
          bordered
          dataSource={dataSource}
          columns={columns}
          rowKey={record => record.id}
          total={total}
          refetch={this.fetchData}
          pagination={pagination}
        />
      </Spin>
    );
  }
}

WeighingDefinitionImportLogs.contextTypes = {
  router: PropTypes.object,
};

export default withForm({}, withRouter(WeighingDefinitionImportLogs));
