import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { updateProjectStatus, updateInjectMoldProjectStatus } from 'src/services/cooperate/project';
import { getQuery } from 'src/routes/getRouteParams';
import UpdateStatusPopConfirm from 'src/containers/project/base/updateProjectStatus/updateStatusPop';
import Localstorage from 'utils/localStorage';
import auth from 'utils/auth';
import { ORGANIZATION_CONFIG, TASK_DISPATCH_TYPE } from 'utils/organizationConfig';
import { PROJECT_CATEGORY_INJECTION_MOULDING } from 'constants';

class UpdateProjectStatus extends Component {
  state = {};

  renderChangeStatusButton = (text, params, iconType, isGcIcon) => {
    const { projectData, freshData, match, useIcon, projectCategory } = this.props;
    const { projectCode, status } = projectData || {};
    const { code: statusCode } = status || {};
    const auths = Localstorage.get('auth');
    const statusToAuth = {
      running: auth.WEB_START_PROJECT,
      aborted: auth.WEB_CANCEL_PROJECT,
      done: auth.WEB_FINISH_PROJECT,
      paused: auth.WEB_PAUSE_PROJECT,
    };
    if (auths.indexOf(statusToAuth[params.toStatus]) === -1) {
      return null;
    }
    return (
      <UpdateStatusPopConfirm
        text={text}
        projectCode={projectCode}
        iconType={useIcon ? iconType : null}
        useIcon={useIcon}
        isGcIcon={isGcIcon}
        projectCategory={projectCategory}
        updateStatusFn={async _params => {
          let res = null;
          try {
            const updateStatusApi =
              projectCategory === PROJECT_CATEGORY_INJECTION_MOULDING
                ? updateInjectMoldProjectStatus
                : updateProjectStatus;
            res = await updateStatusApi({
              ...params,
              code: projectCode,
              fromStatus: statusCode,
              ..._params,
            });
          } catch (e) {
            res = e ? e.response : null;
          }
          const query = getQuery(match);
          if (typeof freshData === 'function') await freshData(query);
          return res;
        }}
      />
    );
  };

  render() {
    const { projectData, style } = this.props;
    const { status } = projectData || {};
    const { code: statusCode } = status || {};
    // 未开始状态可进行的操作是开始，取消。
    // 执行中状态可进行的操作是暂停，结束。
    // 暂停中状态可进行的操作是继续，结束。
    return (
      <div style={{ display: 'inline-block', ...style }}>
        {statusCode === 'created' ? (
          <div>
            {this.renderChangeStatusButton('开始', { toStatus: 'running' }, 'jixu1', true)}
            {_.get(Localstorage.get('CONFIG'), `${ORGANIZATION_CONFIG.taskDispatchType}.configValue`) ===
            TASK_DISPATCH_TYPE.manager
              ? null
              : this.renderChangeStatusButton('取消', { toStatus: 'aborted' }, 'quxiao', true)}
          </div>
        ) : null}
        {statusCode === 'running' ? (
          <div>
            {this.renderChangeStatusButton('暂停', { toStatus: 'paused' }, 'zanting1', true)}
            {this.renderChangeStatusButton('结束', { toStatus: 'done' }, 'jieshu', true)}
          </div>
        ) : null}
        {statusCode === 'paused' ? (
          <div>
            {this.renderChangeStatusButton('继续', { toStatus: 'running' }, 'jixu1', true)}
            {this.renderChangeStatusButton('结束', { toStatus: 'done' }, 'jieshu', true)}
          </div>
        ) : null}
      </div>
    );
  }
}

UpdateProjectStatus.propTypes = {
  style: PropTypes.object,
  projectData: PropTypes.object,
  freshData: PropTypes.func,
  match: PropTypes.any,
  useIcon: PropTypes.bool,
  isGcIcon: PropTypes.bool,
  projectCategory: PropTypes.number,
};

UpdateProjectStatus.contextTypes = {
  router: PropTypes.object,
};

export default UpdateProjectStatus;
