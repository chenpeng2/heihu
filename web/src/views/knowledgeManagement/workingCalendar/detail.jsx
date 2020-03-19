import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { Spin, Tooltip, Icon } from 'src/components';
import { replaceSign } from 'src/constants';
import { black, middleGrey } from 'src/styles/color';
import { getWorkingCalendarDetail } from 'src/services/knowledgeBase/workingCalendar';
import ChangeUseStatus from 'src/containers/workingCalendar/base/changeUseStatus';
import LinkToOperationHistory from 'src/containers/workingCalendar/base/linkToOperationHistory';
import LinkToEditWorkingCalendar from 'src/containers/workingCalendar/base/linkEditWorkingCalendarPage';
import { getAvailableDateValue, getTimeRange } from 'src/containers/workingCalendar/utils';
import { WORKINGDAY } from 'src/containers/workingCalendar/constant';

type Props = {
  match: {},
};

class Detail extends Component {
  props: Props;
  state = {
    code: null,
    loading: false,
    detailData: null,
  };

  componentDidMount() {
    const code = _.get(this.props, 'match.params.id');

    this.setState({ code }, () => {
      this.fetchDetailDataAndSetState();
    });
  }

  fetchDetailDataAndSetState = () => {
    const { code } = this.state;
    if (!code) return null;

    this.setState({ loading: true });

    getWorkingCalendarDetail(code)
      .then(res => {
        const data = _.get(res, 'data.data');
        this.setState({
          detailData: data,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderItem = (label, component) => {
    const labelStyle = { color: middleGrey, width: 100, display: 'inline-block', textAlign: 'right' };
    const componentStyle = {
      display: 'inline-block',
      marginLeft: 10,
      verticalAlign: 'top',
      maxWidth: 1000,
      overflowWrap: 'break-word',
    };
    const containerStyle = { margin: '20px 0 20px 20px' };

    return (
      <div style={containerStyle}>
        <div style={labelStyle}>{label}</div>
        <div style={componentStyle}>{component || replaceSign}</div>
      </div>
    );
  };

  renderOperation = () => {
    const { code } = this.state;

    return (
      <div>
        <LinkToEditWorkingCalendar
          render={() => {
            return (
              <div style={{ marginRight: 30 }} >
                <Icon iconType={'gc'} type={'bianji'} style={{ verticalAlign: 'middle' }} />
                <span>编辑</span>
              </div>);
          }}
          id={code}
        />
        <LinkToOperationHistory id={code} />
      </div>
    );
  };

  render() {
    const { loading, detailData, code } = this.state;

    const {
      workstations,
      status,
      availableDateValue,
      availableDateType,
      startTime,
      endTime,
      workingDay,
      operatingHour,
      priority,
    } =
      detailData || {};

    const availableDate = getAvailableDateValue(availableDateValue, availableDateType);
    const workstationNames = Array.isArray(workstations) ? workstations.map(({ name }) => name).join(',') : replaceSign;
    const timeRange = getTimeRange(startTime, endTime);
    const isWorkingDate = WORKINGDAY[workingDay] || replaceSign;
    const workingTimeNames = operatingHour ? operatingHour.name : replaceSign;

    return (
      <Spin spinning={loading}>
        <div style={{ margin: '20px 0 30px 20px' }}>
          <div
            style={{
              color: black,
              fontSize: 16,
              display: 'inline-block',
            }}
          >
            规则详情
          </div>
          <div style={{ float: 'right', marginRight: 20 }}>{this.renderOperation()}</div>
        </div>
        {this.renderItem('适用工位', <div style={{ width: 700 }} >{workstationNames || replaceSign}</div>)}
        {this.renderItem('适用日期', availableDate || replaceSign)}
        {this.renderItem('适用时间范围', timeRange)}
        {this.renderItem('是否工作日', isWorkingDate)}
        {this.renderItem('工作时间', workingTimeNames)}
        {this.renderItem('优先级', priority)}
        {this.renderItem(
          '状态',
          <div>
            <span style={{ marginRight: 10 }}>{status ? status.name : null}</span>
            <ChangeUseStatus code={code} statusNow={status} fetchData={this.fetchDetailDataAndSetState} />
          </div>,
        )}
      </Spin>
    );
  }
}

export default withRouter(Detail);
