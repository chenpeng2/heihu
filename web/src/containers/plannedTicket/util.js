import _ from 'lodash';
import React from 'react';
import { message, Tooltip } from 'components';
import { PLAN_TICKET_NORMAL, PLAN_TICKET_BAITING, PLAN_TICKET_INJECTION_MOULDING } from 'constants';
import { formatToUnix } from 'src/utils/time';
import { replaceSign, FIELDS } from 'src/constants';
import LocalStorage from 'src/utils/localStorage';
import { getUser } from 'src/services/auth/user';
import { getProcessRoutings } from 'src/services/bom';
import { getMboms } from 'src/services/bom/mbom';
import { getEbomListWithExactSearch } from 'src/services/bom/ebom';
import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { applyAuditPlannedTicket } from 'src/services/cooperate/plannedTicket';
import { getAttachments } from 'src/services/attachment';
import { arrayIsEmpty } from 'src/utils/array';
import { thousandBitSeparator } from 'utils/number';

export const plannedTicketStatus = {
  1: '新建',
  2: '已排程',
  3: '已下发',
  4: '已取消',
};

export const getAuditConfig = type => {
  const config = getOrganizationConfigFromLocalStorage();
  if (type === 'workOrderAudit') return _.get(config, 'config_plan_work_order_audit.configValue');
  if (type === 'taskAudit') return _.get(config, 'config_produce_task_deliverable.configValue');
  if (type === 'baitingWorkOrder') return _.get(config, 'config_plan_work_order_baiting.configValue');
  return {
    workOrderAuditConfig: _.get(config, 'config_plan_work_order_audit.configValue'),
    taskAuditConfig: _.get(config, 'config_produce_task_deliverable.configValue'),
  };
};

export const plannedTicket_types = {
  storage: { name: '面向库存', value: 1 },
  purchaseOrderType: { name: '面向销售订单', value: 2 },
};

// 查找计划工单类型
export const findPlannedTicketTypes = value => {
  let res = null;
  Object.values(plannedTicket_types).forEach(i => {
    if (i.value === value) res = i;
  });

  return res;
};

// 判断是否是子计划工单
export const isSubPlannedTicket = data => {
  return data && data.parentOrder;
};

// 将form的数据格式化提交给后端
export const formatFormValueForSubmit = data => {
  const {
    mbom,
    ebom,
    managers,
    planners,
    material,
    processRoute,
    purchaseOrder,
    attachments: files,
    fatherPlannedTicketProcess,
    auditorIds: payloadAuditorIds,
    taskAuditorIds: payloadTaskAuditorIds,
    customFields,
    key,
    children: _children,
    createTransReq,
    ...rest
  } = data;

  let materialCode = _.get(material, 'key'); // 如果页面产出物料未被修改 则获取下拉框的key作为code
  if (materialCode && materialCode.indexOf('@') !== -1) {
    materialCode = materialCode.split('@') && materialCode.split('@')[0];
  }
  const processRouteCode = _.get(processRoute, 'key');
  const processRouteLabel = _.get(processRoute, 'label');
  const processRouteName = processRouteLabel ? processRouteLabel.replace(`${processRouteCode}/`, '') : null;
  const planBeginTime = _.get(data, 'planBeginTime') ? formatToUnix(data.planBeginTime) : null;
  const planEndTime = _.get(data, 'planEndTime') ? formatToUnix(data.planEndTime) : null;
  const purchaseOrderCode = _.get(purchaseOrder, 'key');
  const mbomVersion = _.get(mbom, 'key');
  const ebomVersion = _.get(ebom, 'label');
  const attachments = _.get(files, 'length') ? files.map(x => x.id) : [];
  const auditorIds = Array.isArray(payloadAuditorIds) ? payloadAuditorIds.filter(x => x) : null;
  const taskAuditorIds = Array.isArray(payloadTaskAuditorIds)
    ? payloadTaskAuditorIds
        .filter(x => x)
        .map(value => {
          return { ids: value && value.map(({ key }) => key) };
        })
    : null;
  const plannerId = planners && planners.map(({ key }) => key);
  const managerId = managers && managers.map(({ key }) => key);
  const children = arrayIsEmpty(_children) ? [] : _children.map(v => formatFormValueForSubmit(v));

  return {
    ...rest,
    mbomVersion,
    ebomVersion,
    planEndTime,
    attachments,
    materialCode,
    planBeginTime,
    processRouteCode,
    processRouteName,
    purchaseOrderCode,
    plannerId,
    managerId,
    auditorIds,
    taskAuditorIds,
    parentProcessCode: fatherPlannedTicketProcess ? _.get(fatherPlannedTicketProcess.key, 'code') : null,
    parentProcessName: fatherPlannedTicketProcess ? _.get(fatherPlannedTicketProcess.key, 'name') : null,
    parentSeq: _.get(fatherPlannedTicketProcess, 'key.seq') || _.get(fatherPlannedTicketProcess, 'key'),
    planners, // 用于前端记录上一次选项
    managers, // 用于前端记录上一次选项
    payloadTaskAuditorIds,
    children,
    customFields: customFields
      ? _.map(customFields, (value, key) => ({
          name: key,
          content: value,
        }))
      : undefined,
  };
};

export const formatBaitingFormValue = data => {};

// 获取不同状态下不可编辑的item
export const getDisableListForPlannedTicket = statusCode => {
  // 新建不可以编辑的字段：父工单工序, 产出物料, (GC-6563 新建状态下「数量」可修改)
  if (statusCode === 1 || statusCode === '1') {
    return {
      product: true,
      parentProcess: true,
      plannedTicketType: true,
      purchaseOrder: true,
    };
  }

  let disabledList = {
    projectCode: true,
    product: true,
    amount: true,
    purchaseOrder: true,
    plannedTicketType: true,
    craft: true,
    priority: true,
    parentProcess: true,
  };

  if (Number(statusCode) === 3) {
    // 已下发的不可以编辑成品批次
    disabledList = { ...disabledList, productBatch: true };
  }

  if (Number(statusCode) !== 1 || Number(statusCode) !== 6) {
    // 只有新建、已审批状态才能编辑生产任务审批人
    disabledList = { ...disabledList, taskAuditorIds: true };
  }

  // 已排程，已经下发不可以编辑的字段：类型，订单，产出物料，数量，工艺，父工单工序。
  return disabledList;
};

// 获取工艺的提示
export const getCraftType = plannTicketData => {
  const { processRouteCode, mbomVersion, ebomVersion, processRouteName } = plannTicketData || {};

  let text = replaceSign;

  if (mbomVersion) {
    text = `生产BOM/${mbomVersion}`;
  }

  if (processRouteCode && processRouteName && ebomVersion) {
    text = `工艺路线/${processRouteCode}-物料清单/${ebomVersion}`;
  }

  if (processRouteName && processRouteCode && !ebomVersion) {
    text = `工艺路线/${processRouteCode}`;
  }

  return text;
};

// 保存计划工单审批人&生产任务审批人
export const savePlannedTicketAuditorIds = data => {
  const { auditorIds, taskAuditorIds } = data || {};
  const username = LocalStorage.get(FIELDS && FIELDS.USER_NAME);
  LocalStorage.set(
    'plannedTicketAuditorIds',
    {
      username,
      auditorIds: auditorIds && auditorIds.map(id => id),
    },
    60 * 60 * 24,
  );
  LocalStorage.set(
    'taskAuditorIds',
    {
      username,
      taskAuditorIds,
    },
    60 * 60 * 24,
  );
};

// 获取localStorage中计划工单审批人
export const getPlannedTicketAuditorIds = () => {
  const username = LocalStorage.get(FIELDS && FIELDS.USER_NAME);
  const lastAuditorInfo = LocalStorage.get('plannedTicketAuditorIds');
  const lastTaskAuditorInfo = LocalStorage.get('taskAuditorIds');
  const res = { auditorIds: null, taskAuditorIds: null };

  if (lastAuditorInfo) {
    const { username: lastUserName, auditorIds } = lastAuditorInfo;
    res.auditorIds = lastUserName === username ? auditorIds : null;
  }

  if (lastTaskAuditorInfo) {
    const { username: lastUserName, taskAuditorIds } = lastTaskAuditorInfo;
    res.taskAuditorIds = lastUserName === username ? taskAuditorIds : null;
  }

  return res;
};

// 保存计划工单列表页「执行状态」筛选
export const savePlannedTicketFilterExecuteStatus = status => {
  // 如果查询时清空了筛选，那么本地也清空
  LocalStorage.set('executeStatusForPlannedTicketFilter', status, 60 * 60 * 24);
};

const plannedTicketPlannersKeyMap = {
  [PLAN_TICKET_NORMAL]: 'plannedTicketPlannerIds',
  [PLAN_TICKET_BAITING]: 'baitingPlannedTicketPlannerIds',
  [PLAN_TICKET_INJECTION_MOULDING]: 'injectPlannedTicketPlannerIds',
};

const plannedTicketManagersKeyMap = {
  [PLAN_TICKET_NORMAL]: 'plannedTicketManagerIds',
  [PLAN_TICKET_BAITING]: 'baitingPlannedTicketManagerIds',
  [PLAN_TICKET_INJECTION_MOULDING]: 'injectPlannedTicketManagerIds',
};

// 保存项目的计划人员
export const savePlannedTicketPlanners = (planners, type = PLAN_TICKET_NORMAL) => {
  if (planners && planners.length > 0) {
    const _planners = planners.map(({ key, label }) => ({
      id: key,
      name: label,
    }));
    LocalStorage.set(plannedTicketPlannersKeyMap[type], _planners, 60 * 60 * 24);
  }
};

// 保存计划工单的生产主管
export const savePlannedTicketManagers = (managers, type = PLAN_TICKET_NORMAL) => {
  if (managers && managers.length > 0) {
    const _managers = managers.map(({ key, label }) => ({
      id: key,
      name: label,
    }));
    LocalStorage.set(plannedTicketManagersKeyMap[type], _managers, 60 * 60 * 24);
  }
};

// 获取localStorage中用于筛选的「执行状态」
export const getPlannedTicketFilterExecuteStatus = () => {
  return LocalStorage.get('executeStatusForPlannedTicketFilter');
};

// 获取localStorage中的项目计划人员
export const getPlannedTicketPlanners = (type = PLAN_TICKET_NORMAL) => {
  return { planners: LocalStorage.get(plannedTicketPlannersKeyMap[type]) };
};

// 获取localStorage中的项目计划人员
export const getPlannedTicketManagers = (type = PLAN_TICKET_NORMAL) => {
  return { managers: LocalStorage.get(plannedTicketManagersKeyMap[type]) };
};

// 获取localStorage中上次选择的成品批次type
export const getPlannedTicketProductBatchType = () => {
  return LocalStorage.get('plannedTicketProductBatchType');
};

// 保存创建时选择的成品批次type
export const savePlannedTicketProductBatchType = type => {
  return LocalStorage.set('plannedTicketProductBatchType', type);
};

// 获取localStorage中的当前用户信息。如果是用户是计划员则返回,不是则不返回
export const getUserInfo = async () => {
  const user = LocalStorage.get('userInfo');
  const userId = user ? user.id : null;

  if (!userId) return;

  const res = await getUser(userId);
  const userRoles = _.get(res, 'data.data.roles');

  if (!Array.isArray(userRoles)) return;

  let isPlanner = false;
  userRoles.forEach(i => {
    if (i && i.id === 4) isPlanner = true;
  });

  if (isPlanner) {
    return user;
  }
};

// 获取计划工单的初始计划人员
export const getInitialPlannerData = async (type = PLAN_TICKET_NORMAL) => {
  const plannersInLocalStorage = getPlannedTicketPlanners(type);
  const userInfo = await getUserInfo();

  // 如果有上次保存的计划人员，使用上次保存的。否则使用当前的用户（如果用户是计划员）
  if (plannersInLocalStorage && plannersInLocalStorage.planners && Array.isArray(plannersInLocalStorage.planners)) {
    return plannersInLocalStorage;
  }

  return {
    planners: userInfo ? [{ id: userInfo.id.toString(), name: userInfo.name }] : [],
  };
};

// 获取计划工单的初始生产主管
export const getInitialManagerData = async (type = PLAN_TICKET_NORMAL) => {
  const managersInLocalStorage = getPlannedTicketManagers(type);

  if (managersInLocalStorage && managersInLocalStorage.managers && Array.isArray(managersInLocalStorage.managers)) {
    return managersInLocalStorage;
  }

  return { managers: null };
};

// 设置默认值给工艺
// 工艺路线时，如果只有一个已发布的工艺路线，则自动选中。
// 生产 BOM 时，如果只有一个已发布的生产 BOM 版本，则自动选中。
// 工艺路线 + 物料清单时，如果只有一个已发布的工艺路线，则自动选中。如果只有一个启用中的物料清单版本则自动选中。
export const setDefaultValueForCraft = (type, form, params, callBacks) => {
  if (!form) return;

  // 这些回调函数是为了在把默认值写入后，执行table显示的回调。
  const { cbForProcessRouting, cbForMbom, cbForEbom } = callBacks || {};

  if (type === 'processRoute') {
    getProcessRoutings({ status: 1 }).then(res => {
      const processRoutings = _.get(res, 'data.data');
      if (Array.isArray(processRoutings) && processRoutings.length === 1) {
        const { code, name } = processRoutings[0];
        form.setFieldsValue({
          processRoute: { key: code, label: `${code}/${name}` },
        });

        if (typeof cbForProcessRouting === 'function') {
          cbForProcessRouting({ key: code, label: `${code}/${name}` });
        }
      }
    });
    return null;
  }

  if (type === 'mbom') {
    const { materialCode } = params || {};
    if (!materialCode) return;

    getMboms({ materialCode, status: 1 }).then(res => {
      const mboms = _.get(res, 'data.data');
      if (Array.isArray(mboms) && mboms.length === 1) {
        const { version } = mboms[0];
        form.setFieldsValue({
          mbom: { key: version, label: version },
        });

        if (typeof cbForMbom === 'function') {
          cbForMbom({ key: version, label: version }, materialCode);
        }
      }
    });
    return null;
  }

  if (type === 'processRouteEbom') {
    getProcessRoutings({ status: 1 }).then(res => {
      const processRoutings = _.get(res, 'data.data');
      if (Array.isArray(processRoutings) && processRoutings.length === 1) {
        const { code, name } = processRoutings[0];
        form.setFieldsValue({
          processRoute: { key: code, label: `${code}/${name}` },
        });
        if (typeof cbForProcessRouting === 'function') {
          cbForProcessRouting({ key: code, label: `${code}/${name}` });
        }
      }
    });

    const { materialCode } = params || {};
    if (!materialCode) return;

    getEbomListWithExactSearch({
      productMaterialCode: materialCode,
      status: 1,
    }).then(res => {
      const eboms = _.get(res, 'data.data');

      if (Array.isArray(eboms) && eboms.length === 1) {
        const { id, version } = eboms[0];
        form.setFieldsValue({
          ebom: { key: id, label: version },
        });

        if (typeof cbForEbom === 'function') {
          cbForEbom({ key: id, label: version });
        }
      }
    });

    return null;
  }

  return null;
};

export const applyForAudit = async (workOrderCodes, onSuccess) => {
  if (Array.isArray(workOrderCodes)) {
    await applyAuditPlannedTicket(workOrderCodes)
      .then(res => {
        const statusCode = _.get(res, 'data.statusCode');
        if (statusCode === 200) {
          message.success('申请成功，已通知审批人！');
          if (typeof onSuccess === 'function') {
            onSuccess();
          }
        } else {
          message.error('申请失败');
        }
      })
      .catch(err => console.log(err));
  }
};

export const fetchAttachmentFiles = async ids => {
  if (!arrayIsEmpty(ids)) {
    try {
      const res = await getAttachments(ids);
      const attachmentFiles = _.get(res, 'data.data');
      return attachmentFiles;
    } catch (error) {
      console.log(error);
    }
  }
};

export const getWorkOrderStatus = status => {
  switch (status) {
    case 1:
      return '新建';
    case 2:
      return '已排程';
    case 3:
      return '已下发';
    case 4:
      return '已取消';
    case 5:
      return '审批中';
    case 6:
      return '已审批';
    default:
      return replaceSign;
  }
};

export const getWorkOrderExecuteStatus = status => {
  switch (status) {
    case 0:
      return '未下发';
    case 1:
      return '未开始';
    case 2:
      return '进行中';
    case 3:
      return '暂停中';
    case 4:
      return '已结束';
    case 5:
      return '已取消';
    default:
      return replaceSign;
  }
};

export function formatColumns(columns) {
  if (arrayIsEmpty(columns)) return [];

  return columns.map(col => {
    const { title, numeric, width, text, length: minLength, dataIndex, prefix, suffix } = col;
    if (numeric) {
      col.align = 'right';
      col.width = width || 100;
      col.render = (data, record) => (typeof data === 'number' ? thousandBitSeparator(data) : replaceSign);
    }
    if (text) {
      col.width = width || 150;
      const length = width > 0 ? Math.floor(width / 10) : 15;
      col.render = (data, record) =>
        data ? <Tooltip text={data} length={minLength > length ? minLength : length} /> : replaceSign;
    }
    col.key = dataIndex;
    col.title = (
      <React.Fragment>
        {prefix}
        {title}
        {suffix}
      </React.Fragment>
    );
    return col;
  });
}

export const getWorkOrderFields = form => {
  const { getFieldsValue } = form || {};
  return Object.keys(getFieldsValue());
};

export const getAllDisabledList = form => {
  if (!form) return {};
  const fields = getWorkOrderFields(form);
  if (arrayIsEmpty(fields)) return {};
  const disabledList = {
    craft: true,
    plannedTicketType: true,
    product: true,
    productBatch: true,
  };
  fields.forEach(field => _.set(disabledList, `${field}`, true));
  return disabledList;
};

export const getLocalFilterParams = () => {
  return LocalStorage.get('workOrderFilterParams');
};

export const saveWorkOrderFilterParams = values => {
  const lastValue = LocalStorage.get('workOrderFilterParams') || {};
  LocalStorage.set('workOrderFilterParams', Object.assign(lastValue, values));
};

export const WORK_ORDER_PLAN_STATUS_CANCELED = 4; // 已取消

export default 'dummy';
