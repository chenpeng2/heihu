export const getCreateRepairTaskUrl = type => `/equipmentMaintenance/repairTask/create?type=${type}`;

export const getCreateRepairTaskByTargetUrl = (type, targetId, targetName) =>
  `/equipmentMaintenance/repairTask/create?type=${type}&targetId=${targetId}&targetName=${targetName}`;

export const getRepairTaskDetailUrl = code => `/equipmentMaintenance/repairTask/detail/${code}`;

export const getRepairTaskListUrl = (pageType = 1) => `/equipmentMaintenance/repairTask?pageType=${pageType}`;

export default 'dummy';
