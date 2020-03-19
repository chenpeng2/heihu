import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { updateStatus } from 'src/services/cooperate/materialRequest';
import { primary } from 'src/styles/color/index';
import log from 'src/utils/log';
import { message } from 'src/components/index';

import { APPLY_STATUS } from '../util';

class UpdateStatus extends Component {
  state = {};

  // 申请状态，暂停状态
  getNextStatus = statusNow => {
    let res = [];

    // 已创建的可以下发，取消
    if (statusNow === APPLY_STATUS.mergeCreated.value || statusNow === APPLY_STATUS.created.value) {
      res = res.concat([APPLY_STATUS.issue, APPLY_STATUS.abort]);
    }

    // 已下发的在web端可以异常结束，暂停
    if (statusNow === APPLY_STATUS.issue.value) {
      res = res.concat([APPLY_STATUS.errorFinish]);
    }

    // 不是完成的状态或取消。都需要根据是否暂停决定下一步是暂停还是继续
    if (
      statusNow !== APPLY_STATUS.issueFinish.value &&
      statusNow !== APPLY_STATUS.acceptFinish.value &&
      statusNow !== APPLY_STATUS.errorFinish.value &&
      statusNow !== APPLY_STATUS.abort.value &&
      statusNow !== APPLY_STATUS.mergeCancel.value
    ) {
      if (statusNow === APPLY_STATUS.stop.value) {
        res = res.concat([APPLY_STATUS.continue]);
      } else {
        res = res.concat([APPLY_STATUS.stop]);
      }
    }

    return res;
  };

  updateStatus = async (nextStatus, id) => {
    if (!id) return;
    const { refetch } = this.props;

    try {
      const res = await updateStatus({ headerId: id, status: nextStatus });
      if (res && res.statusCode === 200) {
        message.success('更新转移申请状态成功');
      }
      if (typeof refetch === 'function') refetch();
    } catch (e) {
      log.error(e);
    }
  };

  render() {
    const { data, style } = this.props;
    const { id, status } = data || {};
    const nextStatus = this.getNextStatus(status);

    return (
      <div style={{ whiteSpace: 'nowrap', ...style }}>
        {Array.isArray(nextStatus)
          ? nextStatus.map(i => {
              const { value, name, actionName } = i || {};
              return (
                <span
                  onClick={() => {
                    this.updateStatus(value, id);
                  }}
                  style={{ color: primary, cursor: 'pointer', marginRight: 5 }}
                >
                  {actionName || name}
                </span>
              );
            })
          : null}
      </div>
    );
  }
}

UpdateStatus.propTypes = {
  style: PropTypes.object,
  data: PropTypes.object.isRequired,
  refetch: PropTypes.func,
};

export default UpdateStatus;
