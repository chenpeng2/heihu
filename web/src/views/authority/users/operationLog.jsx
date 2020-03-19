import * as React from 'react';
import { SimpleTable, Button, DatePicker, Text } from 'components';
import { userRecords } from 'src/services/auth/user';
import { setLocation } from 'utils/url';
import { formatUnix, formatToUnix } from 'utils/time';

type PropType = {
  match: {
    params: {
      id: string,
    },
  },
};

const RangePicker = DatePicker.RangePicker;

class OperationLog extends React.Component<PropType> {
  state = {
    dataSource: [],
    total: 0,
  };

  componentDidMount() {
    this.setDataSource();
  }

  setDataSource = params => {
    const { createdAtFrom, createdAtTill } = this.state;
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const _params = { createdAtFrom, createdAtTill, userId: id, ...params };
    setLocation(this.props, _params);
    userRecords(_params).then(({ data: { data, total } }) => {
      this.setState({ dataSource: data.map(node => ({ ...node })), total });
    });
  };

  columns = [
    { title: '操作时间', dataIndex: 'createdAt', render: time => formatUnix(time) },
    { title: '操作用户', dataIndex: 'opUserName', key: 'opUserName' },
    { title: '操作类型', dataIndex: 'type', key: 'type' },
    { title: '操作详情', dataIndex: 'remark', key: 'remark' },
  ];
  render() {
    const { dataSource, total } = this.state;
    return (
      <div>
        <div style={{ margin: 20 }}>
          <span>
            <Text>操作时间</Text>
          </span>
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: 360, margin: '0 10px' }}
            onChange={dates => {
              this.setState({
                createdAtFrom: dates[0] && formatToUnix(dates[0]),
                createdAtTill: dates[1] && formatToUnix(dates[1]),
              });
            }}
          />
          <Button
            icon="search"
            onClick={() => {
              this.setDataSource({ page: 1 });
            }}
          >
            <Text>查询</Text>
          </Button>
        </div>
        <div>
          <SimpleTable
            columns={this.columns}
            dataSource={dataSource}
            pagination={{
              total,
              onChange: page => {
                this.setDataSource({ page });
              },
            }}
          />
        </div>
      </div>
    );
  }
}

export default OperationLog;
