import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withForm, RestPagingTable, DatePicker, Button, Badge } from 'src/components';
import { blacklakeGreen, white, middleGrey } from 'src/styles/color';
import moment, { formatRangeUnix } from 'src/utils/time';
import { replaceSign } from 'src/constants';
import { getQuery } from 'src/routes/getRouteParams';
import { getProjectOperationHistory } from 'src/services/cooperate/project';

const RangePicker = DatePicker.RangePicker;

type Props = {
  viewer: any,
  match: {},
  form: any,
  loading: boolean,
};

class ProjectOperationHistory extends Component {
  props: Props;
  state = {
    code: null,
    logs: [],
    logCount: 0,
  };

  componentWillMount() {
    const { match } = this.props;
    const { params } = match || {};
    const { projectCode } = params || {};

    this.setState({ code: projectCode });
  }

  componentDidMount() {
    const { match } = this.props;
    const query = getQuery(match);

    this.setInitialValue();
    this.getValueByTime({ ...query, page: 1 });
  }

  setInitialValue = () => {
    const today = moment().add(1, 'days');
    const lastMothToday = moment().subtract(1, 'months');

    const { form } = this.props;

    form.setFieldsValue({ time: [lastMothToday, today] });
  };

  getProjectLogsAndSetState = p => {
    const { code } = this.state;
    const { isInjectionMold } = this.props;
    const params = { code: decodeURIComponent(code), size: 10, ...p };
    if (isInjectionMold) {
      params.type = 2;
    }
    getProjectOperationHistory(params).then(res => {
      const { data } = res || {};
      const { total, data: realData } = data || {};
      this.setState({
        logs: realData || [],
        logCount: total || 0,
      });
    });
  };

  getValueByTime = params => {
    const { form } = this.props;
    const value = form.getFieldsValue();
    const { time } = value;

    if (Array.isArray(time) && time.length === 2) {
      const _time = formatRangeUnix(time);
      this.getProjectLogsAndSetState({ startTime: _time[0], endTime: _time[1], ...params });
    } else {
      this.getProjectLogsAndSetState(params);
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
        dataIndex: 'operator',
        render: data => {
          const { name } = data || {};
          return name || replaceSign;
        },
      },
      {
        title: '操作类型',
        dataIndex: 'actionDisplay',
        render: data => {
          if (data) {
            return data;
          }
          return replaceSign;
        },
      },
      {
        title: '操作详情',
        maxWidth: { C: 45 },
        dataIndex: 'msg',
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
          <div style={{ display: 'inline-block', margin: 5, color: middleGrey }}>操作时间</div>
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
      </div>
    );
  }
}

export default withForm({}, withRouter(ProjectOperationHistory));
