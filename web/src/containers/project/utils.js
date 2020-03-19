import _ from 'lodash';

import { replaceSign } from 'src/constants';
import LocalStorage from 'src/utils/localStorage';
import { getProcessRoutings } from 'src/services/bom';
import { getUser } from 'src/services/auth/user';
import { getMboms } from 'src/services/bom/mbom';
import { getEbomListWithExactSearch } from 'src/services/bom/ebom';
import { getProject } from 'src/services/cooperate/project';
import { middleGrey } from 'src/styles/color';

// 用来判断是否是子计划
export const isSubProject = projectData => {
  return projectData && projectData.parentCode;
};

// 用来获取编辑项目的路径
export const getEditProjectPath = (isSubProject, projectCode) => {
  return isSubProject
    ? `/cooperate/projects/${encodeURIComponent(projectCode)}/editSonProject`
    : `/cooperate/projects/${encodeURIComponent(projectCode)}/edit`;
};

// 获取项目的工艺类型
export const getCraftType = projectData => {
  const { processRouting, mbomVersion, ebom } = projectData || {};

  let text = replaceSign;

  if (mbomVersion) {
    text = `生产BOM/${mbomVersion}`;
  }

  if (processRouting && ebom) {
    text = `工艺路线/${processRouting.code}-物料清单/${ebom.version}`;
  }

  if (processRouting && !ebom) {
    text = `工艺路线/${processRouting.code}`;
  }

  return text;
};

// 格式化form表单中的值来提交给后端
export const formatValueToSubmit = value => {
  const {
    product,
    amountProductPlanned,
    projectCode,
    managerIds,
    processRouting,
    mbom,
    purchaseOrder,
    attachments,
    startTimePlanned,
    endTimePlanned,
    ebom,
    remark,
    planner,
    projectType,
    parentProcess,
    productBatchType,
    productBatch,
    productBatchNumberRuleId,
    orderMaterialId,
  } = value;

  let productCode = _.get(product, 'key', null); // 如果页面产出物料未被修改 则获取下拉框的key作为code
  if (productCode && productCode.indexOf('@') !== -1) {
    productCode = productCode.split('@') && productCode.split('@')[0];
  }

  return {
    projectCode,
    productName: '',
    productCode,
    productBatchType,
    productBatch,
    productBatchNumberRuleId,
    managerIds: Array.isArray(managerIds) ? managerIds.map(({ key }) => key) : [],
    processRoutingCode: processRouting ? processRouting.key : null,
    mbomVersion: mbom ? mbom.key : null,
    purchaseOrderCode: purchaseOrder ? purchaseOrder.key : null,
    amountProductPlanned,
    startTimePlanned: startTimePlanned ? Date.parse(startTimePlanned) : null,
    endTimePlanned: endTimePlanned ? Date.parse(endTimePlanned) : null,
    attachmentIds: Array.isArray(attachments) && attachments.length > 0 ? attachments.map(({ restId }) => restId) : [],
    ebomId: ebom ? ebom.key : null,
    plannerIds: Array.isArray(planner) ? planner.map(i => i.key) : [],
    description: remark,
    type: projectType || null,
    parentSeq: parentProcess ? parentProcess.key : null,
    orderMaterialId,
  };
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

// 保存项目的生产主管
export const saveProjectManagers = managers => {
  if (managers && managers.length > 0) {
    const _managers = managers.map(({ key, label }) => ({ id: key, name: label }));
    LocalStorage.set('managersForProject', _managers, 60 * 60 * 24);
  }
};

// 保存项目的成品批号生成方式
export const saveProjectProductBatchType = type => {
  LocalStorage.set('projectProductBatchType', type);
};

// 获取localStorage中的项目计划人员
export const getProjectPlanners = () => {
  return ({ planners: LocalStorage.get('plannersForProject') });
};

// 获取localStorage中的项目生产主管
export const getProjectManagers = () => {
  return ({ managers: LocalStorage.get('managersForProject') });
};

// 获取localStorage中的项目成品批号生成方式
export const getInitialProjectProductBatchType = () => {
  return LocalStorage.get('projectProductBatchType');
};

// 获取项目的初始计划人员
export const getInitialPlannersData = async () => {
  const plannersInLocalStorage = getProjectPlanners();
  const userInfo = await getUserInfo();

  const planners = [];

  if (plannersInLocalStorage && plannersInLocalStorage.planner && Array.isArray(plannersInLocalStorage.planner)) {
    plannersInLocalStorage.planner.forEach(i => {
      const { key, label } = i || {};

      planners.push({ id: key, name: label });
    });

    return planners;
  }

  return userInfo ? [{ id: userInfo.id, name: userInfo.name }] : undefined;
};

// 获取项目的初始生产主管
export const getInitialManagersData = () => {
  const managersInLocalStorage = getProjectManagers();

  if (managersInLocalStorage && managersInLocalStorage.manager && Array.isArray(managersInLocalStorage.manager)) {
    return managersInLocalStorage;
  }
};

// 设置默认值给工艺
// 工艺路线时，如果只有一个已发布的工艺路线，则自动选中。
// 生产 BOM 时，如果只有一个已发布的生产 BOM 版本，则自动选中。
// 工艺路线 + 物料清单时，如果只有一个已发布的工艺路线，则自动选中。如果只有一个启用中的物料清单版本则自动选中。
export const setDefaultValueForCraft = (type, form, params, callBacks) => {
  if (!form) return;

  // 这些回调函数是为了在把默认值写入后，执行table显示的回调。
  const { cbForProcessRouting, cbForMbom, cbForEbom } = callBacks || {};

  if (type === 'processRouting') {
    getProcessRoutings({ status: 1 }).then(res => {
      const processRoutings = _.get(res, 'data.data');
      if (Array.isArray(processRoutings) && processRoutings.length === 1) {
        const { code, name } = processRoutings[0];
        form.setFieldsValue({
          processRouting: { key: code, label: `${code}/${name}` },
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

  if (type === 'processRoutingAndEbom') {
    getProcessRoutings({ status: 1 }).then(res => {
      const processRoutings = _.get(res, 'data.data');
      if (Array.isArray(processRoutings) && processRoutings.length === 1) {
        const { code, name } = processRoutings[0];
        form.setFieldsValue({
          processRouting: { key: code, label: `${code}/${name}` },
        });
        if (typeof cbForProcessRouting === 'function') {
          cbForProcessRouting({ key: code, label: `${code}/${name}` });
        }
      }
    });

    const { materialCode } = params || {};
    if (!materialCode) return;

    getEbomListWithExactSearch({ productMaterialCode: materialCode, status: 1 }).then(res => {
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

// 获取附件的提示
export const getAttachmentTips = files => {
  if (!Array.isArray(files) || !files.length) return ' ';

  const text = files
    .map(i => {
      const { originalFileName } = i || {};

      return originalFileName;
    })
    .filter(i => i)
    .join(',');

  return `${text}来自销售订单`;
};

export const AttachmentPromptStyle = {
  color: middleGrey,
  position: 'absolute',
  marginLeft: 120,
  top: 4,
  width: 315,
  lineHeight: '16px',
  wordBreak: 'break-all',
};

export const AttachmentTipStyle = {
  paddingLeft: 122,
  width: 560,
  wordBreak: 'break-all',
  position: 'relative',
  top: '-12px',
  color: 'rgb(142, 152, 174)',
};

// 本地保存创建排程的时候的执行人类型
export const saveScheduleTaskWorkerType = typeValue => {
  if (typeValue) {
    LocalStorage.set('scheduleTaskWorkerType', typeValue, 60 * 60 * 24);
  }
};

// 本地保存创建排程的时候的工作时长单位
export const saveScheduleTaskWorkingTimeUnit = unit => {
  if (unit) {
    LocalStorage.set('scheduleTaskWorkingTimeUnit', unit, 60 * 60 * 24);
  }
};

export const getScheduleTaskWorkerType = () => {
  return LocalStorage.get('scheduleTaskWorkerType');
};

export const getScheduleWorkingTimeUnit = () => {
  return LocalStorage.get('scheduleTaskWorkingTimeUnit');
};

// 保存项目列表的状态
export const saveProjectListStatuses = value => {
  if (value) {
    LocalStorage.set('projectListStatuses', value, 60 * 60 * 24);
  }
};

export const getProjectListStatuses = () => {
  return LocalStorage.get('projectListStatuses');
};

// 工艺路线的创建类型
export const PROJECT_CREATE_TYPE = {
  processRoutingAndEbom: 'processRoutingAndEbom',
  processRouting: 'processRouting',
  mbom: 'mbom',
};

export const getProjectCreatedType = async projectCode => {
  if (!projectCode) return;

  const res = await getProject({ code: projectCode });
  return _.get(res, 'data.data.createdType');
};

export default 'dummy';
