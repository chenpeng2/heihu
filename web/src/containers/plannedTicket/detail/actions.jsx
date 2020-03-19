import React, { Component } from 'react';
import _ from 'lodash';
import auth from 'utils/auth';
import { Link } from 'components';
import { primary } from 'src/styles/color';

import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';

import CancelPlannedTicket from '../base/cancelPlannedTicket';
import ApplyAuditPlannedTicket from '../base/applyAuditPlannedTicket';
import { getAuditConfig } from '../util';

type Props = {
  editPath: String,
  logPath: String,
  match: any,
  status: Number,
  cancelPlan: () => {},
  createSonPlannedTicket: string,
  code: string,
  needAudit: Number,
  fetchData: () => {},
  parentCode: string,
  category: Number,
};

class Actions extends Component {
  props: Props;
  state = {};

  renderApplyAuditLink = (status, auditConfig) => {
    const { code, fetchData, needAudit, parentCode } = this.props;

    if (auditConfig !== 'true' || parentCode) return null;
    return status === 1 && needAudit ? (
      <ApplyAuditPlannedTicket
        refetch={fetchData}
        workOrderCodes={[code]}
        style={{ marginRight: 30 }}
        icon="plus-circle-o"
      />
    ) : null;
  };

  renderCreateSonTicketLink = (status, auditConfig) => {
    const { createSonPlannedTicket, needAudit } = this.props;
    const disabled = auditConfig === 'true' && needAudit ? [1].indexOf(status) === -1 : false;
    console.log(status);

    return status === 4 ? null : (
      <Link
        disabled={disabled}
        icon="plus-circle-o"
        style={{ marginRight: 30 }}
        to={createSonPlannedTicket}
        auth={auth.WEB_CREATE_PLAN_WORK_ORDER}
      >
        创建子计划工单
      </Link>
    );
  };

  renderCanceltLink = (status, auditConfig) => {
    if (auditConfig !== 'true' && [1, 2].indexOf(status) === -1) return null;
    const cancelDisabled = auditConfig === 'true' ? [1].indexOf(status) === -1 : [1, 2].indexOf(status) === -1;
    const { code, fetchData } = this.props;

    return (
      <CancelPlannedTicket
        disabled={cancelDisabled}
        iconStyle={{ color: primary, marginRight: 5 }}
        iconType={'close-circle-o'}
        status={status}
        code={code}
        fetchData={fetchData}
      />
    );
  };

  render() {
    const workOrderAuditConfig = getAuditConfig('workOrderAudit');
    const { editPath, logPath, status, needAudit, category } = this.props;
    const editDisabled =
      workOrderAuditConfig === 'true' && needAudit
        ? [1].indexOf(status) === -1 && needAudit
        : [1, 2, 3].indexOf(status) === -1;

    return (
      <div>
        {this.renderApplyAuditLink(status, workOrderAuditConfig)}
        {category === 1 ? this.renderCreateSonTicketLink(status, workOrderAuditConfig) : null}
        <Link
          disabled={editDisabled}
          auth={auth.WEB_EDIT_PLAN_WORK_ORDER}
          style={{ marginRight: 30 }}
          icon="edit"
          to={editPath}
        >
          编辑
        </Link>
        <Link icon="bars" style={{ marginRight: 30 }} to={logPath}>
          查看操作记录
        </Link>
        {this.renderCanceltLink(status, workOrderAuditConfig)}
      </div>
    );
  }
}

export default Actions;
