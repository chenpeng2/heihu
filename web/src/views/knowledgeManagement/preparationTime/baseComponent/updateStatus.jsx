import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { primary } from 'src/styles/color';
import { updatePreparationTime } from 'src/services/knowledgeBase/preparationTime';
import { message } from 'src/components';

import { UPDATE_STATUS, knowledgeItem } from '../utils';

class UpdateStatus extends Component {
  state = {};

  render() {
    const { style, statusNow, id, cbForUpdate } = this.props;
    if (!id) return null;

    let nextText;
    let nextStatusValue;

    if (statusNow === UPDATE_STATUS.inUse.value) {
      nextText = UPDATE_STATUS.stop.name ? UPDATE_STATUS.stop.name.slice(0, -1) : null;
      nextStatusValue = UPDATE_STATUS.stop.value;
    } else {
      nextText = UPDATE_STATUS.inUse.name ? UPDATE_STATUS.inUse.name.slice(0, -1) : null;
      nextStatusValue = UPDATE_STATUS.inUse.value;
    }

    return (
      <div style={style}>
        <span
          onClick={async () => {
            const res = await updatePreparationTime({ id, status: nextStatusValue });
            const statusCode = _.get(res, 'data.statusCode');
            if (statusCode === 200) {
              message.success(`${nextText}成功`);
              if (typeof cbForUpdate === 'function') cbForUpdate();
            }
          }}
          style={{ color: primary, cursor: 'pointer' }}
        >
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
};

export default UpdateStatus;
