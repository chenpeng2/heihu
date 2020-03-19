import * as React from 'react';
import { Table, DatePicker, Button, Badge, withForm, FormattedMessage } from 'components';
import moment from 'moment';
import _ from 'lodash';
import { setLocation, getParams } from 'utils/url';
import { formatUnix, daysAgo, formatRangeUnix } from 'utils/time';
import { error } from 'styles/color';
import { queryEbomOperation } from 'src/services/bom/ebom';
import styles from './index.scss';

const RangePicker = DatePicker.RangePicker;

type propsType = {
  loading: boolean,
  form: any,
  match: {
    params: {
      restid: string,
    },
  },
};
type stateType = {};

class OperationLog extends React.Component<propsType, stateType> {
  state = {
    dataSource: [],
    time: [daysAgo(30), moment()],
    count: 0,
  };

  componentDidMount() {
    const { match } = this.props;
    const query = match.location.query.queryAfterJsonStringify;
    let params = {};
    if (query) {
      params = JSON.parse(query);
    }
    const {
      form: { setFieldsValue },
    } = this.props;
    if (!params.startTime && !params.endTime) {
      setFieldsValue({ time: [daysAgo(30), moment()] });
    } else {
      setFieldsValue({ time: [formatUnix(params.startTime), formatUnix(params.endTime)] });
    }
    this.fetchData({ page: 1, size: 10 });
  }

  fetchData = async params => {
    const id = this.props.match.params.restid;
    const { getFieldValue } = this.props.form;
    let fromAt;
    let toAt;
    if (getFieldValue('time') && getFieldValue('time').length > 0) {
      fromAt = formatRangeUnix(getFieldValue('time'))[0];
      toAt = formatRangeUnix(getFieldValue('time'))[1];
    }
    const _params = {
      id,
      size: 10,
      fromAt,
      toAt,
      ...params,
    };
    setLocation(this.props, p => ({ ...p, ..._params }));
    const {
      data: { data, count },
    } = await queryEbomOperation(_params);
    this.setState({
      count,
      dataSource: data.map(node => ({
        createdAt: formatUnix(node.createdAt),
        username: node.userName,
        type: node.type,
        content: node.content,
        flag: node.flag,
      })),
    });
  };
  render(): React.Node {
    const { dataSource, count } = this.state;
    const { loading, form } = this.props;
    const { getFieldDecorator } = form;
    const query = getParams().query && JSON.parse(getParams().query);
    const columns = [
      { title: '操作时间', dataIndex: 'createdAt', key: 'createdAt', type: 'startTime' },
      { title: '操作用户', dataIndex: 'username', key: 'username', type: 'personName' },
      { title: '操作类型', dataIndex: 'type.display', key: 'type.display', width: 100 },
      {
        title: '操作详情',
        dataIndex: 'content',
        key: 'content',
        render: (content, record): React.Node => {
          return (
            <span>
              {record.flag === 1 ? (
                <Badge status="success" text={content} />
              ) : (
                <span style={{ color: error }}>
                  <Badge status="error" />
                  {content}
                </span>
              )}
            </span>
          );
        },
      },
    ];
    return (
      <div>
        <div className={styles.logsHeader}>
          <FormattedMessage defaultMessage={'操作时间'} />
          {getFieldDecorator('time', {
            initialValue: [daysAgo(30), moment()],
          })(<RangePicker format="YYYY-MM-DD" showTime />)}
          <Button
            onClick={() =>
              this.fetchData({
                page: 1,
                size: 10,
              })
            }
          >
            查询
          </Button>
        </div>
        <Table
          loading={_.get(loading, 'ebomOperation')}
          pagination={{
            total: count,
            current: _.get(query, 'page', 1),
            onChange: page => this.fetchData({ page }),
          }}
          refetch={this.fetchData}
          columns={columns}
          dataSource={dataSource}
        />
      </div>
    );
  }
}

export default withForm({}, OperationLog);
