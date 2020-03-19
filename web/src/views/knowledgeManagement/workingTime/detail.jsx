import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { getTotalTime } from 'src/containers/workingTime/utils';
import { Spin } from 'src/components';
import { replaceSign } from 'src/constants';
import { black, middleGrey } from 'src/styles/color';
import { getWorkingTimeDetail } from 'src/services/knowledgeBase/workingTime';
import ChangeUseStatus from 'src/containers/workingTime/base/changeUseStatus';
import TimeBucketTable from 'src/containers/workingTime/detail/timeBucketTable';
import LinkToOperationHistory from 'src/containers/workingTime/base/linkToOperationHistory';

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

    getWorkingTimeDetail(code)
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
        <LinkToOperationHistory code={code} />
      </div>
    );
  };

  render() {
    const { loading, detailData, code } = this.state;

    const { name, status, periods } = detailData || {};

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
            工作时间详情
          </div>
          <div style={{ float: 'right', marginRight: 20 }}>{this.renderOperation()}</div>
        </div>
        {this.renderItem('名称', name)}
        {this.renderItem(
          '状态',
          <div>
            <span style={{ marginRight: 10 }}>{status ? status.name : null}</span>
            <ChangeUseStatus code={code} statusNow={status} fetchData={this.fetchDetailDataAndSetState} />
          </div>,
        )}
        {this.renderItem('时间段', <TimeBucketTable periods={periods} />)}
        {this.renderItem('总时长', getTotalTime(periods))}
      </Spin>
    );
  }
}

export default withRouter(Detail);
