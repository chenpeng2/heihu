import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { black, border, greyWhite, middleGrey } from 'src/styles/color/index';
import { Timeline, Spin } from 'src/components/index';
import { getOperationLogs } from 'src/services/cooperate/materialRequest';
import log from 'src/utils/log';
import moment from 'src/utils/time';

class OperationHistoryTimeline extends Component {
  state = {
    loading: false,
    data: [],
  };

  componentDidMount() {
    const { data } = this.props;
    const { id } = data || {};
    this.fetchAndSetData({ headerId: id });
  }

  fetchAndSetData = async params => {
    this.setState({ loading: true });
    try {
      const res = await getOperationLogs(params);
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
    const { data: operationData } = this.state;
    const { changeChineseToLocale } = this.context;

    return (
      <Spin spinning={this.state.loading}>
        <div>
          <div style={{ color: black, fontSize: 14 }}>{changeChineseToLocale('操作记录')}</div>
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
            {Array.isArray(operationData) ? (
              <Timeline>
                {operationData
                  .map(i => {
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
                  })
                  .reverse()}
              </Timeline>
            ) : null}
          </div>
        </div>
      </Spin>
    );
  }
}

OperationHistoryTimeline.propTypes = {
  style: PropTypes.object,
  data: PropTypes.any,
};
OperationHistoryTimeline.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default OperationHistoryTimeline;
