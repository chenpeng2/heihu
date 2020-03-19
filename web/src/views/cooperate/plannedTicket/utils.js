import _ from 'lodash';
import { error, border, warning, fontSub, primary } from 'src/styles/color';
import { ORGANIZATION_CONFIG, includeOrganizationConfig } from 'utils/organizationConfig';
import { PLAN_TICKET_NORMAL, PLAN_TICKET_BAITING, PLAN_TICKET_INJECTION_MOULDING } from 'src/constants';

export const TABLE_UNIQUE_KEY = 'WorkOrderListTableColumnConfig';

export const PLAN_STATUS_CREATED = 1; // 新建
export const PLAN_STATUS_SCHEDULED = 2; // 已下发
export const PLAN_STATUS_DISTRIBUTED = 3; // 已排程
export const PLAN_STATUS_CANCELED = 4; // 已取消
export const PLAN_STATUS_AUDITING = 5; // 审批中
export const PLAN_STATUS_AUDITED = 6; // 已审批

export const planStatus = {
  1: '新建',
  2: '已排程',
  3: '已下发',
  4: '已取消',
  5: '审批中',
  6: '已审批',
};

export const executeStatus = {
  1: { text: '未开始', color: border },
  2: { text: '进行中', color: primary },
  3: { text: '暂停中', color: warning },
  4: { text: '已结束', color: error },
  5: { text: '已取消', color: fontSub },
};

export const planStatusMap = {
  [PLAN_STATUS_CREATED]: '新建',
  [PLAN_STATUS_SCHEDULED]: '已排程',
  [PLAN_STATUS_DISTRIBUTED]: '已下发',
  [PLAN_STATUS_CANCELED]: '已取消',
  [PLAN_STATUS_AUDITING]: '审批中',
  [PLAN_STATUS_AUDITED]: '已审批',
};

export const organizationPlanStatusMap = () => {
  let statusMap = planStatusMap;
  if (!includeOrganizationConfig(ORGANIZATION_CONFIG.planWorkOrderAudit)) {
    statusMap = _.omit(statusMap, [PLAN_STATUS_AUDITING, PLAN_STATUS_AUDITED]);
  }
  return statusMap;
};

export default planStatus;

export const organizationPlanTicketCategory = () =>
  [
    PLAN_TICKET_NORMAL,
    includeOrganizationConfig(ORGANIZATION_CONFIG.baitingWorkOrder) && PLAN_TICKET_BAITING,
    includeOrganizationConfig(ORGANIZATION_CONFIG.injectionMouldingWorkOrder) && PLAN_TICKET_INJECTION_MOULDING,
  ].filter(n => n);
