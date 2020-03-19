import React, { Component } from 'react';

import { primary, error } from 'src/styles/color';
import { updateWorkingCalendarStatus } from 'src/services/knowledgeBase/workingCalendar';

import { STATUS_DISPLAY } from '../constant';

type Props = {
  code: string,
  style: {},
  statusNow: {},
  fetchData: () => {}
};

class ChangeUseStatus extends Component {
  props: Props;
  state = {
    color: primary,
  };

  getNextStatus = statusNow => {
    if (!statusNow) return null;

    const { code } = statusNow;
    if (code === 0) return { code: 1, name: STATUS_DISPLAY[1] };
    if (code === 1) return { code: 0, name: STATUS_DISPLAY[0] };

    return null;
  };

  render() {
    const { color } = this.state;
    const { statusNow, fetchData, code: workingTimeCode } = this.props;
    const nextStatus = this.getNextStatus(statusNow);

    const { name, code } = nextStatus || {};
    return (
      <div
        onClick={() => {
          updateWorkingCalendarStatus({ status: code, id: workingTimeCode }).then(() => {
            this.setState({ color: primary }, () => {
              if (fetchData && typeof fetchData === 'function') fetchData();
            });
          }).catch(e => {
            this.setState({ color: error });
            return e;
          });
        }}
        style={{ marginRight: '10px', display: 'inline-block', color, cursor: 'pointer' }}
      >
        {name}
      </div>
    );
  }
}

export default ChangeUseStatus;
