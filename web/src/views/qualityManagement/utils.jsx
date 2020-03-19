import _ from 'lodash';
import { ORGANIZATION_CONFIG, includeOrganizationConfig } from 'utils/organizationConfig';
import { showLoading } from 'utils/loading';
import log from 'src/utils/log';
import { getCustomRuleList } from 'src/services/systemConfig/customRule';
import MyStore from 'store';
import { setCustomRuleList } from 'src/store/redux/actions/organizationConfig/customRule';
import { QCTASK_STATUS_AUDITING, QCTASK_STATUS_REJECTED, qcTaskStatusMap } from './constants';

export const qcReportAuditConfigIsTrue = () => includeOrganizationConfig(ORGANIZATION_CONFIG.qcReportAudit);

export const getOrgQcTaskStatusMap = () => {
  let statusMap = qcTaskStatusMap;
  if (!includeOrganizationConfig(ORGANIZATION_CONFIG.qcReportAudit)) {
    statusMap = _.omit(statusMap, [QCTASK_STATUS_AUDITING, QCTASK_STATUS_REJECTED]);
  }
  return statusMap;
};

export const fetchCustomRuleData = async () => {
  try {
    const res = await getCustomRuleList();
    const data = _.get(res, 'data.data');
    MyStore.dispatch(setCustomRuleList(data));
  } catch (e) {
    log.error(e);
  }
};

export default 'dummy';
