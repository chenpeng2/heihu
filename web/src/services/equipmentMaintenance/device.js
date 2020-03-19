import request from 'utils/request';

const baseUrl = 'equipment/v1';

export function getDevices(params) {
  return request(`${baseUrl}/equipment_prod/_list`, { params });
}

export function addDevice(data) {
  return request.post(`${baseUrl}/equipment_prod/_add`, data);
}

export function addModule(data) {
  return request.post(`${baseUrl}/equipment_module/_add`, data);
}

export function getDeviceDetail(id) {
  return request(`${baseUrl}/equipment_prod/_overviewForWeb/${id}`);
}

export function getModuleDetail(id) {
  return request(`${baseUrl}/equipment_module/_overviewForWeb/${id}`);
}

export function getDeviceEditDetail(id) {
  return request(`${baseUrl}/equipment_prod/_detailForWeb/${id}`);
}

export function updateDevice(id, data) {
  return request.post(`${baseUrl}/equipment_prod/_update/${id}`, data);
}

export function updateModule(id, data) {
  return request.post(`${baseUrl}/equipment_module/_update/${id}`, data);
}

export function getDeviceModule(id) {
  return request(`${baseUrl}/equipment_module/_detailForWeb/${id}`);
}

export function changeWorkStation(id, workStationId = '') {
  return request.post(`${baseUrl}/equipment_prod/_changeWorkStation/${id}?workStationId=${workStationId}`);
}

export function importDevice(params) {
  return request.post(`${baseUrl}/equipment_prod/_import`, params);
}

export function deviceImportList(params) {
  return request.get(`${baseUrl}/equipment_prod/_import_list`, { params });
}

export function queryDeviceImportDetail(importId) {
  return request(`${baseUrl}/equipment_prod/_import_detail/${importId}`);
}

export function queryDeviceImportErrorList(params) {
  return request(`${baseUrl}/equipment_prod/_import_error_list/${params.importId}`, { params });
}

export function deviceScrap(id) {
  return request.post(`${baseUrl}/equipment_prod/_scrap/${id}`);
}

export function getDeviceLog(id, params) {
  return request.get(`${baseUrl}/equipment_prod/_logList/${id}`, { params });
}

export function getModuleLog(id, params) {
  return request.get(`${baseUrl}/equipment_module/_logList/${id}`, { params });
}

export function enableDevice(id) {
  return request.post(`${baseUrl}/equipment_prod/_enable/${id}`);
}

export function disableDevice(id) {
  return request.post(`${baseUrl}/equipment_prod/_disable/${id}`);
}

export function configClean(id, params) {
  return request.post(`${baseUrl}/equipment_prod/_configClean/${id}`, params);
}

export function cleanDevice(id) {
  return request.post(`${baseUrl}/equipment_prod/_clean/${id}`);
}

export function dirtyDevice(id) {
  return request.post(`${baseUrl}/equipment_prod/_dirty/${id}`);
}

export function editDeviceCode(id, code) {
  return request.post(`${baseUrl}/equipment_prod/_changeCode/${id}?code=${encodeURIComponent(code)}`);
}

export function editEquipmentModuleCode(id, code) {
  return request.post(`${baseUrl}/equipment_module/_changeCode/${id}?code=${encodeURIComponent(code)}`);
}

export function addDeviceMetric(params) {
  return request.post(`${baseUrl}/device/metric/_add`, params);
}

export function getMetricList(params) {
  return request.get(`${baseUrl}/device/metric/_list`, params);
}

export function getEquipProdStrategyList(id, params) {
  return request.get(`${baseUrl}/equipment_prod/${id}/task/strategy/application/_list`, params);
}

export function getEquipMoudleStrategyList(id, params) {
  return request.get(`${baseUrl}/equipment_module/${id}/task/strategy/application/_list`, params);
}

// 设备校验
export function updateCalibrationConfig(id, params) {
  return request.post(`${baseUrl}/equipment_prod/_updateCalibrationConfig/${id}`, params);
}

export default getDevices;
