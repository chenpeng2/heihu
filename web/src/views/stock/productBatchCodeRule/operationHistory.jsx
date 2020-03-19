import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { withForm, RestPagingTable, DatePicker, Button, Badge } from 'src/components';
import { blacklakeGreen, white, middleGrey } from 'src/styles/color';
import moment, { formatRangeUnix } from 'src/utils/time';
import { replaceSign } from 'src/constants';
import { getQuery } from 'src/routes/getRouteParams';
import { getProductBatchCodeRuleOperationHistory } from 'src/services/productBatchCodeRule';
import {} from 'src/containers/productBatchCodeRule/util';

const RangePicker = DatePicker.RangePicker;

class OperationHistory extends Component {
  state = {
    code: null,
    logs: [],
    logCount: 0,
    loading: false,
  };

  componentWillMount() {
    const { match } = this.props;
    const id = _.get(match, 'params.code');

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

  getAndSetData = p => {
    const { code } = this.state;

    this.setState({ loading: true });

    getProductBatchCodeRuleOperationHistory({ id: code, ...p })
      .then(res => {
        const { data, total } = _.get(res, 'data');
        this.setState({
          logs: data || [],
          logCount: total || 0,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getValueByTime = params => {
    const { form } = this.props;
    const value = form.getFieldsValue();
    const { time } = value;
    const _time = formatRangeUnix(time);

    if (Array.isArray(_time) && _time.length === 2) {
      this.getAndSetData({ searchStartTime: _time[0], searchEndTime: _time[1], ...params });
    } else {
      this.getAndSetData(params);
    }
  };

  getColumns = () => {
    return [
      {
        title: '操作时间',
        dataIndex: 'createAt',
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
        dataIndex: 'operationTypeDisplay',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '操作详情',
        maxWidth: { C: 45 },
        dataIndex: 'operationDetail',
        render: data => {
          return <Badge status={'success'} text={data || replaceSign} />;
        },
      },
    ];
  };

  render() {
    const { form } = this.props;
    const { logs, logCount, loading } = this.state;

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
        <span
          style={{ color: middleGrey, paddingLeft: 20, position: 'relative', top: 20 }}
        >{`总共${logCount}条项目`}</span>
      </div>
    );
  }
}

OperationHistory.propTypes = {
  style: PropTypes.object,
  match: PropTypes.object,
  form: PropTypes.object,
};

export default withForm({}, OperationHistory);
