import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { primary, black, warning } from 'styles/color';
import { updateCapacityConstraint } from 'services/knowledgeBase/capacityConstraint';
import { message } from 'components';

import { knowledgeItem, STATUS } from '../constants';

class UpdateStatus extends Component {
  state = {};

  render() {
    const { style, statusNow, data, id, cbForUpdate } = this.props;
    const { code } = data || {};
    if (!id) return null;

    // 获取下一个text和status
    let nextText;
    let nextStatusValue;

    if (statusNow === STATUS.inUse.value) {
      nextText = STATUS.stop.name ? STATUS.stop.name.slice(0, -1) : null;
      nextStatusValue = STATUS.stop.value;
    } else {
      nextText = STATUS.inUse.name ? STATUS.inUse.name.slice(0, -1) : null;
      nextStatusValue = STATUS.inUse.value;
    }

    const changeStatus = async () => {
      const res = await updateCapacityConstraint(id, { status: nextStatusValue });
      const statusCode = _.get(res, 'data.statusCode');
      if (statusCode === 200) {
        message.success(`${nextText}${knowledgeItem.display}成功`);
        if (typeof cbForUpdate === 'function') cbForUpdate();
      }
    };

    return (
      <div style={style}>
        <span onClick={changeStatus} style={{ color: primary, cursor: 'pointer' }}>
          {nextText}
        </span>
      </div>
    );
  }
}

UpdateStatus.propTypes = {
  style: PropTypes.object,
  statusNow: PropTypes.any,
  id: PropTypes.string,
  cbForUpdate: PropTypes.func,
  data: PropTypes.any,
};

export default UpdateStatus;
