import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import auth from 'src/utils/auth';
import { Link, authorityWrapper, message } from 'components';
import { updateRepeatQcAuditStatus } from 'src/services/qualityManagement/qcTask';
import { REPEAT_QCTASK_AUDIT_STATUS_PASSED } from '../../constants';

const LinkWithAuth = authorityWrapper(Link);

/** 创建复检审核-通过操作 */
const PassLink = ({ params, redirectUrl, refetchData, history, ...rest }) => {
  const { repeatQcReqId, taskCode, qcConfigName } = params || {};

  return (
    <LinkWithAuth
      auth={auth.WEB_QUALITY_REPORT_VERIFY}
      onClick={async () => {
        if (repeatQcReqId) {
          await updateRepeatQcAuditStatus({ id: repeatQcReqId, status: REPEAT_QCTASK_AUDIT_STATUS_PASSED })
            .then(res => {
              const statusCode = _.get(res, 'data.statusCode');
              if (statusCode === 200) {
                message.success(`${taskCode} | ${qcConfigName}的复检创建审核通过`);
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
              message.error(`${taskCode} | ${qcConfigName}的复检创建审核通过失败`);
            })
            .catch(err => console.log(err));
        }
      }}
      {...rest}
    >
      通过
    </LinkWithAuth>
  );
};

PassLink.propTypes = {
  code: PropTypes.string,
};

export default withRouter(PassLink);
