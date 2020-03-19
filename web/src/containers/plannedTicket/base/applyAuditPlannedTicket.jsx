import React, { Component } from 'react';

import { Link } from 'components';
import auth from 'src/utils/auth';

import { applyForAudit } from '../util';

type Props = {
  style: {},
  workOrderCodes: [string],
  refetch: () => {},
};

class ApplyAuditLink extends Component {
  props: Props;
  state = {};

  render() {
    const { style, workOrderCodes, refetch, ...rest } = this.props;
    return (
      <Link auth={auth.WEB_CREATE_PLAN_WORK_ORDER} onClick={() => applyForAudit(workOrderCodes, refetch)} style={{ marginRight: 10, ...style }} {...rest}>
        申请审批
      </Link>
    );
  }
}

export default ApplyAuditLink;
