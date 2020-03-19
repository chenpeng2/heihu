import React from 'react';
import { DatePicker, Button, SimpleTable, FormItem, withForm } from 'components';
import { formatUnix, formatToUnix } from 'utils/time';
import PropTypes from 'prop-types';
import moment from 'moment';

const RangerPicker = DatePicker.RangePicker;

class SOPLog extends React.PureComponent {
  state = {
    dataSource: null,
    total: 0,
    current: 1,
    query: {},
  };

  componentDidMount() {
    this.setDataSource();
  }

  setDataSource = async params => {
    const SOPId = this.props.match.params.SOPId;
    const query = {
      page: 1,
      size: 10,
      sopId: SOPId,
      sopTemplateId: SOPId,
      ...this.state.query,
      ...params,
    };
    const {
      data: { data, total },
    } = await this.props.getLogApi(query);
    this.setState({ dataSource: data, total, current: query.page, query });
  };

  render() {
    const { dataSource, total, current } = this.state;
    const {
      form: { getFieldDecorator, getFieldsValue },
      operatorTypeMap,
    } = this.props;
    const columns = [
      { title: '操作时间', dataIndex: 'createdAt', render: time => formatUnix(time) },
      { title: '操作用户', dataIndex: 'operatorName' },
      { title: '操作类型', dataIndex: 'operatorType', render: type => operatorTypeMap.get(type) },
      { title: '操作详情', dataIndex: 'msg' },
    ].map(node => ({ ...node, key: node.title }));
    return (
      <div>
        <div>
          <FormItem label="操作时间">
            {getFieldDecorator('time')(
              <RangerPicker
                showTime={{ defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')] }}
                style={{ marginRight: 10 }}
              />,
            )}
            <Button
              icon="search"
              onClick={() => {
                const { time } = getFieldsValue();
                this.setDataSource({
                  page: 1,
                  createdAtFrom: time[0] && formatToUnix(time[0]),
                  createdAtTill: time[1] && formatToUnix(time[1]),
                });
              }}
            >
              查询
            </Button>
          </FormItem>
        </div>
        <SimpleTable
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          pagination={{ total, onChange: current => this.setDataSource({ page: current }), current }}
        />
      </div>
    );
  }
}

SOPLog.propTypes = {
  form: PropTypes.any,
  getLogApi: PropTypes.func,
  operatorTypeMap: PropTypes.instanceOf(Map),
};

export default withForm({}, SOPLog);
