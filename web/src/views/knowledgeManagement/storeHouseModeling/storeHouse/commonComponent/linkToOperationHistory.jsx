import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'src/components';
import { getOperationHistoryPageUrl } from '../utils';

const LinkToOperationHistory = (props: { withIcon: boolean, code: any, style: any }, context) => {
  const { code, style, withIcon } = props;
  return (
    <Link
      icon={withIcon ? 'bars' : null}
      style={style}
      onClick={() => {
        context.router.history.push(getOperationHistoryPageUrl(code));
      }}
    >
      操作记录
    </Link>
  );
};

LinkToOperationHistory.contextTypes = {
  router: PropTypes.any,
};

export default LinkToOperationHistory;
