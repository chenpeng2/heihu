import React from 'react';
import { getSOPTaskHistory } from 'services/knowledgeBase/sop';
import { DatePicker, Button, SimpleTable, withForm } from 'components';
import { daysAgo, formatToUnix, formatUnixMoment, formatUnix } from 'utils/time';
import { setLocation, getParams } from 'utils/url';
import Color from 'styles/color';
import CONSTANT from '../../common/SOPTaskConstant';

const RangerPicker = DatePicker.RangePicker;
class SOPTaskLog extends React.PureComponent {
  state = {
    dataSource: null,
    total: 0,
  };

  componentDidMount() {
    const { form: { setFieldsValue } } = this.props;
    const { queryObj } = getParams();
    const initValue = { time: [formatToUnix(daysAgo(30)), formatToUnix(daysAgo(0))] };
    const query = {
      ...initValue,
      ...queryObj,
    };
    setFieldsValue({ time: query.time });
    this.setDataSource(query);
  }

  setDataSource = async params => {
    const { match: { params: { taskId } } } = this.props;
    const query = setLocation(this.props, p => ({ taskId, page: 1, size: 10, ...p, ...params }));
    const { data: { data, total } } = await getSOPTaskHistory({
      ...query,
      createdAtFrom: query && query.time[0],
      createdAtTill: query && query.time[1],
      time: undefined,
    });
    this.setState({ dataSource: data, total });
  };

  getColumns = () => {
    return [
      { title: '操作时间', dataIndex: 'createdAt', render: time => formatUnix(time) },
      { title: '操作用户', dataIndex: 'operatorName' },
      { title: '操作类型', dataIndex: 'action', render: action => CONSTANT.SOPTaskAction.get(action) },
      { title: '操作详情', dataIndex: 'msg' },
    ].map(node => ({ ...node, key: node.title }));
  };

  render() {
    const { form: { getFieldDecorator, getFieldsValue } } = this.props;
    const { dataSource, total } = this.state;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', margin: 20 }} className="child-gap">
          <span style={{ color: Color.fontSub }}>操作时间</span>
          {getFieldDecorator('time', {
            normalize: ([startTime, endTime]) => {
              return startTime ? [formatUnixMoment(startTime), formatUnixMoment(endTime)] : [];
            },
          })(<RangerPicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
          <Button
            icon="search"
            onClick={() => {
              const { time } = getFieldsValue();
              this.setDataSource({
                page: 1,
                time: time.length > 0 ? [formatToUnix(time[0]), formatToUnix(time[1])] : [],
              });
            }}
          >
            查询
          </Button>
        </div>
        <SimpleTable
          columns={this.getColumns()}
          dataSource={dataSource}
          rowKey="id"
          pagination={{
            total,
            onChange: page => this.setDataSource({ page }),
          }}
        />
      </div>
    );
  }
}

export default withForm({}, SOPTaskLog);
