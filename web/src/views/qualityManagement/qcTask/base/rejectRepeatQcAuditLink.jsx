import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import auth from 'src/utils/auth';
import { authorityWrapper, message, Link } from 'components';
import { updateRepeatQcAuditStatus } from 'src/services/qualityManagement/qcTask';
import { REPEAT_QCTASK_AUDIT_STATUS_REJECTED } from '../../constants';

const LinkWithAuth = authorityWrapper(Link);

/** 创建复检审核-拒绝操作 */
const RejectLink = ({ params, redirectUrl, refetchData, history, ...rest }) => {
  const { repeatQcReqId, taskCode, qcConfigName } = params || {};

  return (
    <LinkWithAuth
      auth={auth.WEB_QUALITY_REPORT_VERIFY}
      onClick={async () => {
        if (repeatQcReqId) {
          await updateRepeatQcAuditStatus({ id: repeatQcReqId, status: REPEAT_QCTASK_AUDIT_STATUS_REJECTED })
            .then(res => {
              const statusCode = _.get(res, 'data.statusCode');
              if (statusCode === 200) {
                message.success(`${taskCode} | ${qcConfigName}的复检创建审核已拒绝`);
                if (redirectUrl) {
                  history.push(redirectUrl);
                  return;
                }
                if (typeof refetchData === 'function') {
                  refetchData();
                  return;
                }
                return;
              }
              message.error(`${taskCode} | ${qcConfigName}的复检创建审核拒绝失败`);
            })
            .catch(err => console.log(err));
        }
      }}
      {...rest}
    >
      拒绝
    </LinkWithAuth>
  );
};

RejectLink.propTypes = {
  params: PropTypes.object,
  redirectUrl: PropTypes.string,
  refetchData: PropTypes.func,
  qcConfigName: PropTypes.string,
};

export default withRouter(RejectLink);
