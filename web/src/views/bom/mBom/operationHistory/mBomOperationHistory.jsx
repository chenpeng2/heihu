import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withForm, RestPagingTable, DatePicker, Button, Badge, FormattedMessage } from 'src/components';
import { blacklakeGreen, white, middleGrey } from 'src/styles/color';
import moment, { formatToUnix, format } from 'src/utils/time';
import { replaceSign } from 'src/constants';
import { getQuery } from 'src/routes/getRouteParams';
import { getMBomOperationLogs } from 'src/services/bom/mbom';

const RangePicker = DatePicker.RangePicker;

type Props = {
  viewer: any,
  match: {},
  form: any,
  loading: boolean,
};

class ProcessRouteOperationHistory extends Component {
  props: Props;
  state = {
    id: null,
    logs: [],
    logCount: 0,
  };

  componentWillMount() {
    const { match } = this.props;
    const { params } = match || {};
    const { mBomId } = params || {};

    this.setState({ id: mBomId });
  }

  componentDidMount() {
    const { match } = this.props;
    const query = getQuery(match);

    this.setInitialValue();
    this.getValueByTime(query);
  }

  setInitialValue = () => {
    const today = moment().add(1, 'days');
    const lastMothToday = moment().subtract(1, 'months');

    const { form } = this.props;

    form.setFieldsValue({ time: [lastMothToday, today] });
  };

  getMBomOperationLogsAndSetState = p => {
    const { id } = this.state;

    getMBomOperationLogs({ id, ...p }).then(res => {
      const { data } = res || {};
      const { count, data: realData } = data || {};
      this.setState({
        logs: realData || [],
        logCount: count || 0,
      });
    });
  };

  getValueByTime = params => {
    const { form } = this.props;
    const value = form.getFieldsValue();
    const { time } = value;
    if (Array.isArray(time) && time.length === 2) {
      this.getMBomOperationLogsAndSetState({
        createdFrom: formatToUnix(time[0].set({ hour: 0, minute: 0, second: 0 })),
        createdTill: formatToUnix(time[1].set({ hour: 23, minute: 59, second: 59 })),
        ...params,
      });
    } else {
      this.getMBomOperationLogsAndSetState(params);
    }
  };

  getColumns = () => {
    return [
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        render: data => {
          if (data) {
            return format(data);
          }
          return replaceSign;
        },
      },
      {
        title: '操作用户',
        dataIndex: 'userName',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '操作类型',
        dataIndex: 'operationType',
        render: data => {
          switch (data) {
            case 0:
              return '创建';
            case 1:
              return '发布';
            case 2:
              return '停用';
            case 3:
              return '编辑';
            case 4:
              return '复制';
            default:
              return replaceSign;
          }
        },
      },
      {
        title: '操作详情',
        maxWidth: { C: 45 },
        dataIndex: 'description',
        render: data => {
          return <Badge status={'success'} text={data || replaceSign} />;
        },
      },
    ];
  };

  render() {
    const { form } = this.props;
    const { logs, logCount } = this.state;

    const { getFieldDecorator } = form;

    return (
      <div>
        <div style={{ margin: 20 }}>
          <div style={{ display: 'inline-block', margin: 5, color: middleGrey }}>
            <FormattedMessage defaultMessage={'操作时间'} />
          </div>
          <div style={{ display: 'inline-block' }}>
            {getFieldDecorator('time')(<RangePicker style={{ width: 260 }} />)}
            <Button
              style={{ background: blacklakeGreen, marginLeft: 10, color: white }}
              icon={'search'}
              onClick={() => {
                this.getValueByTime();
              }}
            >
              查询
            </Button>
          </div>
        </div>
        <RestPagingTable dataSource={logs} columns={this.getColumns()} total={logCount} refetch={this.getValueByTime} />
      </div>
    );
  }
}

export default withForm({}, withRouter(ProcessRouteOperationHistory));
