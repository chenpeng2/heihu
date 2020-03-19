import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import auth from 'src/utils/auth';
import { Link, message } from 'components';
import { queryESignatureStatus } from 'src/services/knowledgeBase/eSignature';

type Props = {
  style: {},
  data: {},
  code: string,
  history: any,
  refetch: () => {},
};

class AuditLink extends Component {
  props: Props;
  state = {};

  checkESignatureStatus = async () => {
    const auditConfigKey = 'plan_order_approval';
    const { code, data } = this.props;

    await queryESignatureStatus(auditConfigKey)
      .then(res => {
        const hasConfig = _.get(res, 'data.data');
        if (hasConfig) {
          this.props.history.push(`/cooperate/plannedTicket/audit/${code}?query=${JSON.stringify(data)}`);
        } else {
          message.error('「审批计划工单」电子签名配置尚未开启');
        }
      })
      .catch(err => console.log(err));
  };

  render() {
    const { style, code, data, ...rest } = this.props;
    return (
      <Link
        onClick={this.checkESignatureStatus}
        // onClick={() => {
        //   this.props.history.push({
        //     pathname: `/cooperate/plannedTicket/audit/${code}`,
        //     state: data,
        //   });
        // }}
        auth={auth.WEB_AUDIT_PLAN_WORK_ORDER}
        style={{ marginLeft: 10, ...style }}
        {...rest}
      >
        审批
      </Link>
    );
  }
}

export default withRouter(AuditLink);
