import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import auth from 'src/utils/auth';
import { Link, authorityWrapper } from 'components';
import { toQcTaskOperationLog } from '../../navigation';

const LinkWithAuth = authorityWrapper(Link);

const OperationLogLink = ({ code, children, ...props }) => {
  return (
    <LinkWithAuth
      auth={auth.WEB_VIEW_QUALITY_TESTING_TASK}
      style={{ marginRight: 10 }}
      onClick={() => {
        if (code) props.history.push(toQcTaskOperationLog({ code }));
      }}
      {...props}
    >
      {children || '日志'}
    </LinkWithAuth>
  );
};

OperationLogLink.propTypes = {
  code: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  children: PropTypes.any,
};

export default withRouter(OperationLogLink);
