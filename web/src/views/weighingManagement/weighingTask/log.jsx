import React, { Component } from 'react';
import { RestPagingTable, withForm, Icon, DatePicker, Button, PlainText } from 'components';
import { getLocation } from 'src/routes/getRouteParams';
import { replaceSign } from 'src/constants';
import { setLocation } from 'utils/url';
import { middleGrey } from 'src/styles/color';
import { queryWeighingTaskLog } from 'src/services/weighing/weighingTask';
import moment, { formatUnix, formatToUnix, dayStart, dayEnd } from 'utils/time';

const { RangePicker } = DatePicker;

type Props = {
  form: any,
  match: any,
};

class WeighingTaskLog extends Component {
  props: Props;
  state = {
    dataSource: [],
    loading: false,
    total: 0,
  };

  componentDidMount = () => {
    this.onSearch();
  };

  getColumns = () => {
    return [
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        render: text => formatUnix(text),
      },
      {
        title: '操作类型',
        dataIndex: 'type',
      },
      {
        title: '操作用户',
        dataIndex: 'userName',
      },
      {
        title: '描述',
        dataIndex: 'detail',
        width: '45%',
        render: data => data || replaceSign,
      },
    ];
  };

  onSearch = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { dates, ...rest } = values;
        const from_at = dates[0] && formatToUnix(dayStart(dates[0]));
        const to_at = dates[1] && formatToUnix(dayEnd(dates[1]));
        const { fetchData } = this.props;
        this.fetchData({ from_at, to_at, page: 1, ...rest });
      }
    });
  };

  fetchData = async params => {
    this.setState({ loading: true });
    const {
      match: {
        params: { id },
      },
      match,
    } = this.props;
    const location = getLocation(match);
    location.query = { ...location.query, ...params };
    setLocation(this.props, () => location.query);
    const {
      data: { data, count },
    } = await queryWeighingTaskLog({ id, size: 10, ...params });
    this.setState({ dataSource: data, total: count, loading: false });
  };

  render() {
    const { dataSource, total, loading } = this.state;
    const columns = this.getColumns();
    const {
      form: { getFieldDecorator },
    } = this.props;
    const lastMonth = moment().subtract(1, 'months');
    const today = moment();

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', margin: 20 }}>
          <PlainText text="操作时间" style={{ color: middleGrey, fontSize: 14 }} />
          <div style={{ marginLeft: 10 }}>
            {getFieldDecorator('dates', {
              initialValue: [lastMonth, today],
            })(<RangePicker />)}
          </div>
          <Button icon="search" style={{ width: 86, marginLeft: 10 }} onClick={this.onSearch}>
            查询
          </Button>
        </div>
        <RestPagingTable
          bordered
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          rowKey={record => record.id}
          total={total}
          refetch={this.fetchData}
        />
      </div>
    );
  }
}

export default withForm({}, WeighingTaskLog);
