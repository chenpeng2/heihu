import request from 'utils/request';

const baseUrl = 'equipment/v1';

export function getSparePartsList(params) {
  return request(`${baseUrl}/equipment_material/_list`, { params });
}

export function getSparePartsValidList(params) {
  return request(`${baseUrl}/equipment_material/_listValid`, { params });
}

export function bindDeviceSpareParts(params) {
  return request.post(`${baseUrl}/equipment_prod/_bind_material/${params.id}?materialCode=${params.code}`);
}

export function unbindDeviceSpareParts(params) {
  return request.post(`${baseUrl}/equipment_prod/_unbind_material/${params.id}?materialCode=${params.code}`);
}

export function bindDeviceTypeSpareParts(params) {
  return request.post(`${baseUrl}/equipment_category/_bindMaterial/${params.id}?materialCode=${params.code}`);
}

export function unbindDeviceTypeSpareParts(params) {
  return request.post(`${baseUrl}/equipment_category/_unbindMaterial/${params.id}?materialCode=${params.code}`);
}

export function bindMoudleSpareParts(params) {
  return request.post(`${baseUrl}/equipment_module/_bind_material/${params.id}?materialCode=${params.code}`);
}

export function unbindMoudleSpareParts(params) {
  return request.post(`${baseUrl}/equipment_module/_unbind_material/${params.id}?materialCode=${params.code}`);
}

export function getEquipmentSparePartsChangeList(id, params) {
  return request(`${baseUrl}/equipment_prod/_material_replace_list/${id}`, { params });
}

export function getModuleSparePartsChangeList(id, params) {
  return request(`${baseUrl}/equipment_module/_material_replace_list/${id}`, { params });
}

export function disableSpareParts(code) {
  return request.post(`${baseUrl}/equipment_material/_disable/?code=${code}`);
}

export function enableSpareParts(code) {
  return request.post(`${baseUrl}/equipment_material/_enable/?code=${code}`);
}

export function craeteSpareParts(params) {
  return request.post(`${baseUrl}/equipment_material/_add`, params);
}

export function editSpareParts(params, code) {
  return request.post(`${baseUrl}/equipment_material/_update/?code=${code}`, params);
}

export function getSpareParts(code) {
  return request(`${baseUrl}/equipment_material/_detail/?code=${code}`);
}

export function importSpareParts(params) {
  return request.post(`${baseUrl}/equipment_material/_import`, params);
}

export function sparePartsImportList(params) {
  return request.get(`${baseUrl}/equipment_material/_import_list`, { params });
}

export function querySparePartsImportDetail(importId) {
  return request(`${baseUrl}/equipment_material/_import_detail/${importId}`);
}

export function querySparePartsImportErrorList(params) {
  return request(`${baseUrl}/equipment_material/_import_error_list/${params.importId}`, { params });
}

export default 'dummy';
