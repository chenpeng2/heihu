import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import auth from 'src/utils/auth';
import authorityWrapper from 'src/components/authorityWrapper';
import { Link, message } from 'components';
import { QCTASK_STATUS_STARTED } from '../../constants';
import UpdateQcTaskStatusLink from './updateQcTaskStatusLink';

const LinkWithAuth = authorityWrapper(Link);

const RejectLink = props => {
  const { params, redirectUrl, refetchData, history, children, ...rest } = props || {};
  const { taskCode } = params || {};

  return (
    <UpdateQcTaskStatusLink
      taskCode={taskCode}
      status={QCTASK_STATUS_STARTED}
      auth={auth.WEB_QUALITY_REPORT_VERIFY}
      onSuccess={() => {
        message.success('撤回成功');
        if (typeof redirectUrl === 'string') {
          history.push(redirectUrl);
          return;
        }
        if (typeof refetchData === 'function') {
          refetchData();
        }
      }}
      onFail={() => {
        message.error('撤回失败');
      }}
      {...rest}
    >
      {children || '撤回'}
    </UpdateQcTaskStatusLink>
  );
};

RejectLink.propTypes = {
  params: PropTypes.object,
  redirectUrl: PropTypes.string,
  refetchData: PropTypes.func,
  qcConfigName: PropTypes.string,
  children: PropTypes.any,
};

export default withRouter(RejectLink);
