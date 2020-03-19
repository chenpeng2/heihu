import React from 'react';
import { FilterSortSearchBar, withForm, DatePicker, Button, SimpleTable, Tooltip } from 'components';
import { getAuditLogs } from 'services/schedule';
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

  componentDidMount() {
    this.setDataSource({ page: 1, size: 10 });
  }

  setDataSource = async params => {
    const {
      form: { getFieldsValue },
    } = this.props;
    const { times } = getFieldsValue();
    const {
      data: { data, count },
    } = await getAuditLogs({
      page: 1,
      size: 10,
      from_at: times[0] && formatRangeUnix(times)[0],
      to_at: times[1] && formatRangeUnix(times)[1],
      ...params,
    });
    this.setState({ dataSource: data, current: params.page, total: count });
  };

  render() {
    const { dataSource, current, total } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const columns = [
      { title: '操作时间', dataIndex: 'createdAt', render: time => formatUnix(time) },
      { title: '操作用户', dataIndex: 'userName' },
      { title: '操作类型', dataIndex: 'type' },
      { title: '操作详情', dataIndex: 'detail', render: detail => <Tooltip text={detail} length={40} /> },
    ];

    return (
      <div>
        <div style={{ display: 'flex', margin: '20px 0' }}>
          <Item label="操作时间">
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
          onChange={pagination => this.setDataSource({ page: pagination.current })}
          pagination={{
            current,
            total,
          }}
        />
      </div>
    );
  }
}

export default withForm({}, LogList);
