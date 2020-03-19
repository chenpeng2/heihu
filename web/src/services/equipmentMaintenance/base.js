import request from 'src/utils/request';

const baseUrl = 'equipment/v1';
const defaultSize = 10;
const defaultPage = 1;

export const getValidDeviceList = async variables => {
  return request.get(`${baseUrl}/device/_listValidDevice`, {
    params: variables,
  });
};

export const getValidDeviceCategoryList = async variables => {
  return request.get(`${baseUrl}/device/_listValidDeviceCategory`, {
    params: variables,
  });
};

export const getEquipmentCategoryDetail = async id => {
  return request.get(`${baseUrl}/equipment_category/_detail/${id}`);
};

export const getMouldCategoryDetail = async id => {
  return request.get(`${baseUrl}/mould_category/_detail/${id}`);
};

export const getReportTemplate = async variables => {
  return request.get(`${baseUrl}/report_template/_listValid`, {
    params: variables,
  });
};

export function addStrategyGroup(params) {
  return request.post(`${baseUrl}/task/strategy/group/_add`, params);
}

export function updateStrategyGroup(params) {
  return request.post(`${baseUrl}/task/strategy/group/${params.id}/_update`, params);
}

export function getStrategyGroupList(params) {
  return request.get(`${baseUrl}/task/strategy/group/_list`, params);
}

export function getStrategyGroupApplicationList(params) {
  return request.get(`${baseUrl}/task/strategy/group/application/_list`, params);
}

export function enableStrategyGroup(params) {
  return request.post(`${baseUrl}/task/strategy/group/application/_enable`, params);
}

export function disableStrategyGroup(params) {
  return request.post(`${baseUrl}/task/strategy/group/application/_disable`, params);
}

export function enableStrategy(id, params) {
  return request.post(`${baseUrl}/equipment_category/${id}/task/strategy/_enable`, params);
}

export function disableStrategy(id, params) {
  return request.post(`${baseUrl}/equipment_category/${id}/task/strategy/_disable`, params);
}

export function enableEquipProdStrategy(id, params) {
  return request.post(`${baseUrl}/equipment_prod/${id}/task/strategy/application/_enable`, params);
}

export function disableEquipProdStrategy(id, params) {
  return request.post(`${baseUrl}/equipment_prod/${id}/task/strategy/application/_disable`, params);
}

export function enableEquipModuleStrategy(id, params) {
  return request.post(`${baseUrl}/equipment_module/${id}/task/strategy/application/_enable`, params);
}

export function disableEquipModuleStrategy(id, params) {
  return request.post(`${baseUrl}/equipment_module/${id}/task/strategy/application/_disable`, params);
}

export function CreateEquipProdTaskByStrategy(id, params) {
  return request.post(`${baseUrl}/equipment_prod/${id}/task/strategy/_createTask`, params);
}

export function CreateEquipMoudleTaskByStrategy(id, params) {
  return request.post(`${baseUrl}/equipment_module/${id}/task/strategy/_createTask`, params);
}

export function UpdateTaskByStrategy(taskCode, params) {
  return request.post(`${baseUrl}/strategy/task/_update/${taskCode}`, params);
}

export function DeleteTaskByStrategy(taskCode) {
  return request.post(`${baseUrl}/strategy/task/_delete/${taskCode}`);
}

export function addProdEquipPlanDownTime(id, params) {
  return request.post(`${baseUrl}/equipment_prod/${id}/downtime/plan/_add`, params);
}

export function updateProdEquipPlanDownTime(id, planId, params) {
  return request.post(`${baseUrl}/equipment_prod/${id}/downtime/plan/${planId}/_update`, params);
}

export function deleteProdEquipPlanDownTime(id, planId, params) {
  return request.post(`${baseUrl}/equipment_prod/${id}/downtime/plan/${planId}/_delete`, params);
}

export function addProdEquipRecordDownTime(id, params) {
  return request.post(`${baseUrl}/equipment_prod/${id}/downtime/record/_add`, params);
}

export function updateProdEquipRecordDownTime(id, recordId, params) {
  return request.post(`${baseUrl}/equipment_prod/${id}/downtime/record/${recordId}/_update`, params);
}

export function deleteProdEquipRecordDownTime(id, recordId, params) {
  return request.post(`${baseUrl}/equipment_prod/${id}/downtime/record/${recordId}/_delete`, params);
}

export function addEquipModulePlanDownTime(id, params) {
  return request.post(`${baseUrl}/equipment_module/${id}/downtime/plan/_add`, params);
}

export function updateEquipModulePlanDownTime(id, planId, params) {
  return request.post(`${baseUrl}/equipment_module/${id}/downtime/plan/${planId}/_update`, params);
}

export function deleteEquipModulePlanDownTime(id, planId, params) {
  return request.post(`${baseUrl}/equipment_module/${id}/downtime/plan/${planId}/_delete`, params);
}

export function addEquipModuleRecordDownTime(id, params) {
  return request.post(`${baseUrl}/equipment_module/${id}/downtime/record/_add`, params);
}

export function updateEquipModuleRecordDownTime(id, recordId, params) {
  return request.post(`${baseUrl}/equipment_module/${id}/downtime/record/${recordId}/_update`, params);
}

export function deleteEquipModuleRecordDownTime(id, recordId, params) {
  return request.post(`${baseUrl}/equipment_module/${id}/downtime/record/${recordId}/_delete`, params);
}

export function getProdEquipPlanDownTime(id, params) {
  return request.get(`${baseUrl}/equipment_prod/${id}/downtime/plan`, params);
}

export function getProdEquipRecordDownTime(id, params) {
  return request.get(`${baseUrl}/equipment_prod/${id}/downtime/record`, params);
}

export function getEquipModulePlanDownTime(id, params) {
  return request.get(`${baseUrl}/equipment_module/${id}/downtime/plan`, params);
}

export function getEquipModuleRecordDownTime(id, params) {
  return request.get(`${baseUrl}/equipment_module/${id}/downtime/record`, params);
}

export function getEquipOverviewStatus(params) {
  return request.get(`${baseUrl}/summary/_snapshot`, { params });
}

export function getEquipOverviewRepairMetric(params) {
  return request.get(`${baseUrl}/summary/_repairMetric`, { params: { searchWithTimeRangeType: false, ...params } });
}

export function getEquipOverviewDowntime(params) {
  return request.get(`${baseUrl}/summary/_downtime`, {
    params: { searchWithTimeRangeType: false, returnDetail: true, ...params },
  });
}

export function getEquipOverviewFault(params) {
  return request.get(`${baseUrl}/summary/_fault`, {
    params: { searchWithTimeRangeType: false, returnDetail: true, searchTopN: 10, ...params },
  });
}

export function getEquipOverviewOperationCost(params) {
  return request.get(`${baseUrl}/summary/_operationCost`, {
    params: { searchWithTimeRangeType: false, returnDetail: true, ...params },
  });
}

// 专为生产设备列表写的接口
export function getEquipProdList(params) {
  return request.get(`${baseUrl}/equipment_prod/_listForApp`, { params });
}

// 工装相关接口
export function getToolingList(params) {
  return request.get(`${baseUrl}/machining_material_unit/_list`, { params });
}

export function getToolingLogList(params) {
  return request.get(`${baseUrl}/machining_material_unit/mould/_listLog`, { params });
}

export function getToolingListDetail(params) {
  return request.get(`${baseUrl}/machining_material_unit/mould/_detail`, { params });
}

export function addTooling(params) {
  return request.post(`${baseUrl}/machining_material_unit/mould/_add`, params);
}

export function updateTooling(id, params) {
  return request.post(`${baseUrl}/machining_material_unit/mould/_update?id=${id}`, params);
}

export function updateToolingStatus(id, status) {
  return request.post(`${baseUrl}/machining_material_unit/mould/_updateStatus?id=${id}&status=${status}`);
}

export function updateToolingPlanInfo(id, params) {
  return request.post(`${baseUrl}/machining_material_unit/mould/_updatePlanInformation?id=${id}`, params);
}

export function importTooling(params) {
  return request.post(`${baseUrl}/machining_material_unit/mould/_import`, params);
}

export function getToolingImportLogList(params) {
  return request.get(`${baseUrl}/machining_material_unit/mould/_importHistory`, { params });
}

export function getToolingImportLogDetail(importId) {
  return request.get(`${baseUrl}/machining_material_unit/mould/_importHistory/${importId}`);
}

export function getToolingImportLogErrorList(importId, params) {
  return request.get(`${baseUrl}/machining_material_unit/mould/_importHistoryDetail/${importId}`, { params });
}

// 工装策略停用
export function disableToolingStrategy(id, params) {
  return request.post(`${baseUrl}/machining_material_unit/mould/${id}/task/strategy/application/_disable`, params);
}

// 工装策略启用
export function enableToolingStrategy(id, params) {
  return request.post(`${baseUrl}/machining_material_unit/mould/${id}/task/strategy/application/_enable`, params);
}

// 通过策略创建工装保养/点检任务
export function createToolingTaskByStrategy(id, params) {
  return request.post(`${baseUrl}/machining_material_unit/mould/${id}/task/strategy/_createTask`, params);
}

export default 'dummy';
