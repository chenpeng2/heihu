import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import auth from 'src/utils/auth';
import { message } from 'components';
import { QCTASK_STATUS_REJECTED } from '../../constants';
import UpdateQcTaskStatusLink from './updateQcTaskStatusLink';

/** 质检报告审核-拒绝操作 */
const RejectLink = (props, context) => {
  const { params, redirectUrl, refetchData, history, customRule, taskData, ...rest } = props || {};
  const { qcConfigName, taskCode } = params || {};
  const { changeChineseTemplateToLocale } = context;

  const onSuccess = () => {
    message.success(
      changeChineseTemplateToLocale('{codeAndName}的质检报告已拒绝', { codeAndName: `${taskCode} | ${qcConfigName}` }),
    );
    if (typeof redirectUrl === 'string') {
      history.push(redirectUrl);
      return;
    }
    if (typeof refetchData === 'function') {
      refetchData();
    }
  };

  const onFail = () => {
    message.error(
      changeChineseTemplateToLocale('{codeAndName}的质检报告拒绝失败', { codeAndName: `${taskCode}|${qcConfigName}` }),
    );
  };

  return (
    <UpdateQcTaskStatusLink
      taskCode={taskCode}
      status={QCTASK_STATUS_REJECTED}
      auth={auth.WEB_QUALITY_REPORT_VERIFY}
      onSuccess={onSuccess}
      onFail={onFail}
      actionType={'reject'}
      taskData={taskData}
      {...rest}
    >
      拒绝
    </UpdateQcTaskStatusLink>
  );
};

RejectLink.propTypes = {
  params: PropTypes.object,
  redirectUrl: PropTypes.string,
  refetchData: PropTypes.func,
  qcConfigName: PropTypes.string,
  taskData: PropTypes.object,
};

RejectLink.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withRouter(RejectLink);
