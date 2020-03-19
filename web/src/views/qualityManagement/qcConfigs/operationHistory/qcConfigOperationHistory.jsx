import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withForm, RestPagingTable, DatePicker, Button, FormattedMessage } from 'src/components';
import { blacklakeGreen, white, middleGrey } from 'src/styles/color';
import moment, { formatRangeUnix } from 'src/utils/time';
import { replaceSign } from 'src/constants';
import { getQuery } from 'src/routes/getRouteParams';
import { getQcConfigOperationLog } from 'src/services/qcConfig';

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
    const { id } = params || {};

    this.setState({ id });
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

  getQcConfigOperationLogAndSetState = p => {
    const { id } = this.state;

    getQcConfigOperationLog({ id, size: 10, ...p }).then(res => {
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
      this.getQcConfigOperationLogAndSetState({ startTime: _time[0], endTime: _time[1], ...params });
    } else {
      this.getQcConfigOperationLogAndSetState(params);
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
        render: name => {
          return name || replaceSign;
        },
      },
      {
        title: '操作类型',
        dataIndex: 'operationType',
        render: data => {
          let label = '';
          switch (data) {
            case 0:
              label = '创建质检方案';
              break;
            case 1:
              label = '编辑质检方案';
              break;
            case 2:
              label = '删除质检方案';
              break;
            case 3:
              label = '应用质检方案';
              break;
            case 4:
            case 5:
              label = '修改质检方案状态';
              break;
            default:
              label = '位置操作类型';
          }
          return <FormattedMessage defaultMessage={label} />;
        },
      },
      {
        title: '操作详情',
        maxWidth: { C: 45 },
        dataIndex: 'description',
        render: data => {
          return data || replaceSign;
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
      </div>
    );
  }
}

export default withForm({}, withRouter(ProjectOperationHistory));
