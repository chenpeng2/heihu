import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import auth from 'src/utils/auth';
import { message } from 'components';
import UpdateQcTaskStatusLink from './updateQcTaskStatusLink';
import { QCTASK_STATUS_FINISHED } from '../../constants';

/** 质检报告审核-通过操作 */
const PassLink = props => {
  const { params, redirectUrl, refetchData, history, customRule, taskData, ...rest } = props || {};
  const { qcConfigName, taskCode, scrapInspection } = params || {};

  const onSuccess = () => {
    message.success(
      `${taskCode} | ${qcConfigName}的质检报告已通过，相关物料的${scrapInspection ? '数量和' : ''}质量状态已更新`,
    );
  };

  const onFail = () => {
    message.error(`${taskCode} | ${qcConfigName}的质检报告通过失败`);
  };

  const extraFunc = () => {
    if (typeof redirectUrl === 'string') {
      history.push(redirectUrl);
      return;
    }
    console.log(refetchData);
    if (typeof refetchData === 'function') {
      refetchData();
    }
  };

  return (
    <UpdateQcTaskStatusLink
      taskCode={taskCode}
      status={QCTASK_STATUS_FINISHED}
      auth={auth.WEB_QUALITY_REPORT_VERIFY}
      onSuccess={onSuccess}
      onFail={onFail}
      extraFunc={extraFunc}
      actionType={'pass'}
      taskData={taskData}
      {...rest}
    >
      通过
    </UpdateQcTaskStatusLink>
  );
};

PassLink.propTypes = {
  params: PropTypes.object,
  redirectUrl: PropTypes.string,
  refetchData: PropTypes.func,
  qcConfigName: PropTypes.string,
  taskData: PropTypes.object,
};

export default withRouter(PassLink);
