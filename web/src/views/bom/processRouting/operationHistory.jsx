import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { withForm, RestPagingTable, DatePicker, Button, Badge, FormattedMessage } from 'src/components';
import { blacklakeGreen, white, middleGrey } from 'src/styles/color';
import moment, { formatRangeUnix } from 'src/utils/time';
import { replaceSign } from 'src/constants';
import { getQuery } from 'src/routes/getRouteParams';
import { queryProcessRoutingLogs } from 'src/services/bom/processRouting';

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
    code: null,
    logs: [],
    logCount: 0,
  };

  componentWillMount() {
    const { match } = this.props;
    const id = _.get(match, 'params.id');

    this.setState({ code: id });
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

  getProcessRoutingLogsAndSetState = p => {
    const { code } = this.state;

    queryProcessRoutingLogs({ code, ...p }).then(res => {
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
    const _time = formatRangeUnix(time);
    if (Array.isArray(_time) && _time.length === 2) {
      this.getProcessRoutingLogsAndSetState({ fromAt: _time[0], toAt: _time[1], ...params });
    } else {
      this.getProcessRoutingLogsAndSetState(params);
    }
  };

  getColumns = () => {
    return [
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        render: data => {
          if (data) {
            return moment(data).format('YYYY/MM/DD HH:mm:ss');
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
          const { display } = data || {};
          if (display) {
            return display;
          }
          return replaceSign;
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
    const { form, loading } = this.props;
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
        <RestPagingTable
          loading={loading}
          dataSource={logs}
          columns={this.getColumns()}
          total={logCount}
          refetch={this.getValueByTime}
        />
        <FormattedMessage
          defaultMessage={'总共{amount}条项目'}
          values={{ amount: logCount }}
          style={{ color: middleGrey, paddingLeft: 20, position: 'relative', top: 20 }}
        />
      </div>
    );
  }
}

export default withForm({}, withRouter(ProcessRouteOperationHistory));
