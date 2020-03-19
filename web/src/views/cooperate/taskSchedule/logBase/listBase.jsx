import React from 'react';
import { FilterSortSearchBar, withForm, DatePicker, Button, SimpleTable, Link } from 'components';
import { getScheduleLogs } from 'services/schedule';
import { formatUnix, formatRangeUnix } from 'utils/time';
import moment from 'moment';

const Item = FilterSortSearchBar.Item;
const RangerPicker = DatePicker.RangePicker;

class LogList extends React.PureComponent {
  state = {
    dataSource: [],
    current: 1,
    total: 0,
  };

  componentWillMount() {
    this.actionName = this.props.actionName || '操作';
  }

  componentDidMount() {
    this.setDataSource({ page: 1, size: 10 });
  }

  setDataSource = async params => {
    const {
      form: { getFieldsValue },
      fetchData,
    } = this.props;
    const { times } = getFieldsValue();
    if (typeof fetchData === 'function') {
      const {
        data: { data, count },
      } = await fetchData({
        page: 1,
        size: 10,
        fromAt: times[0] && formatRangeUnix(times)[0],
        toAt: times[1] && formatRangeUnix(times)[1],
        ...params,
      });
      this.setState({ dataSource: data, current: params.page, total: count });
    }
  };

  render() {
    const { getColumns, form } = this.props;
    const { dataSource, current, total } = this.state;
    const { getFieldDecorator } = form;
    const _columns = [
      { title: `${this.actionName}时间`, dataIndex: 'createdAt', render: time => formatUnix(time) },
      { title: `${this.actionName}用户`, dataIndex: 'userName' },
      { title: `${this.actionName}结果`, dataIndex: 'status' },
      { title: `${this.actionName}详情`, dataIndex: 'content' },
      { title: '操作', dataIndex: 'id', render: id => <Link to={`${location.pathname}/detail/${id}`}>查看</Link> },
    ].map(node => ({ key: node.title, ...node }));
    const columns = typeof getColumns === 'function' ? getColumns(_columns) : _columns;
    return (
      <div>
        <div style={{ display: 'flex', margin: '20px 0' }}>
          <Item label={`${this.actionName}时间`}>
            {getFieldDecorator('times', {
              initialValue: [moment().subtract(1, 'months'), moment()],
            })(<RangerPicker />)}
          </Item>
          <Button icon="search" onClick={() => this.setDataSource({ page: 1 })}>
            查询
          </Button>
        </div>
        <SimpleTable
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          pagination={{
            onChange: current => this.setDataSource({ page: current }),
            current,
            total,
          }}
        />
      </div>
    );
  }
}

export default withForm({}, LogList);
