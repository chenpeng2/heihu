import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { UNIT_STATUS } from 'src/containers/unit/util';
import { primary } from 'src/styles/color';
import { updateUnitStatus } from 'src/services/knowledgeBase/unit';
import { message, FormattedMessage } from 'src/components';

class UpdateUnitStatus extends Component {
  state = {};

  render() {
    const { style, statusNow, id, cbForUpdate } = this.props;
    if (!id) return null;

    let nextText;
    let nextStatusValue;

    if (statusNow === UNIT_STATUS.inUse.value) {
      nextText = UNIT_STATUS.stop.name ? UNIT_STATUS.stop.name.slice(0, -1) : null;
      nextStatusValue = UNIT_STATUS.stop.value;
    } else {
      nextText = UNIT_STATUS.inUse.name ? UNIT_STATUS.inUse.name.slice(0, -1) : null;
      nextStatusValue = UNIT_STATUS.inUse.value;
    }

    return (
      <div style={style}>
        <FormattedMessage
          defaultMessage={nextText}
          onClick={async () => {
            const res = await updateUnitStatus(id, nextStatusValue);
            const statusCode = _.get(res, 'data.statusCode');
            if (statusCode === 200) {
              message.success(`${nextText}成功`);
              if (typeof cbForUpdate === 'function') cbForUpdate();
            }
          }}
          style={{ color: primary, cursor: 'pointer' }}
        />
      </div>
    );
  }
}

UpdateUnitStatus.propTypes = {
  style: PropTypes.object,
  statusNow: PropTypes.any,
  id: PropTypes.string,
  cbForUpdate: PropTypes.func,
};

export default UpdateUnitStatus;
