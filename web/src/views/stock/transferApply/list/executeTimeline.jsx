import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { black, border, greyWhite, middleGrey } from 'src/styles/color/index';
import { Timeline, Spin } from 'src/components/index';
import { getMaterialExecuteLog } from 'src/services/cooperate/materialRequest';
import log from 'src/utils/log';
import moment from 'src/utils/time';

class ExecuteProgress extends Component {
  state = {
    loading: false,
    data: [],
  };

  componentDidMount() {
    const { data } = this.props;
    const { id } = data || {};
    this.fetchAndSetData({ itemId: id });
  }

  fetchAndSetData = async params => {
    this.setState({ loading: true });
    try {
      const res = await getMaterialExecuteLog(params);
      const data = _.get(res, 'data.data');
      this.setState({
        data,
      });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { data } = this.props;
    const { receiveAmount, sendingAmount, planingAmount, materialUnit } = data || {};
    const sendProgress = `${sendingAmount} / ${planingAmount} ${materialUnit}`;
    const receiveProgress = `${receiveAmount} / ${planingAmount} ${materialUnit}`;

    const { data: executeData } = this.state;

    return (
      <Spin spinning={this.state.loading}>
        <div>
          <div style={{ color: black, fontSize: 14 }}>执行进度</div>
          <div style={{ color: middleGrey, fontSize: 12 }}>
            发出进度：
            {sendProgress}
          </div>
          <div style={{ color: middleGrey, fontSize: 12 }}>
            接收进度：
            {receiveProgress}
          </div>
          <div
            style={{
              background: greyWhite,
              marginTop: 20,
              padding: 20,
              borderRadius: 2,
              height: 200,
              width: 300,
              overflowY: 'scroll',
              border: `1px solid ${border}`,
            }}
          >
            {Array.isArray(executeData) ? (
              <Timeline>
                {executeData.map(i => {
                  const { operatorName, unitName, action, amount, createdAt } = i || {};

                  return (
                    <div>
                      <span>
                        {action} {amount} {unitName}
                      </span>
                      <span style={{ margin: '0px 10px' }}>{operatorName}</span>
                      <span>{moment(createdAt).format('YYYY/MM/DD HH:mm')}</span>
                    </div>
                  );
                })}
              </Timeline>
            ) : null}
          </div>
        </div>
      </Spin>
    );
  }
}

ExecuteProgress.propTypes = {
  style: PropTypes.object,
  data: PropTypes.any,
};

export default ExecuteProgress;
