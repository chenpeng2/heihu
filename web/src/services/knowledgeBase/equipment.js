import request from 'src/utils/request';

const baseUrl = 'equipment/v1';
const defaultSize = 10;
const defaultPage = 1;

// 故障原因
export const getFaultCausesList = async ({ page, size, searchContent, searchStatus }) => {
  return request.get(`${baseUrl}/fault_reason/_list`, {
    params: { page: page || defaultPage, size: size || defaultSize, searchContent, searchStatus },
  });
};

// 用来选择搜索故障原因用
export const getSearchFaultCausesList = async params => {
  return request.get(`${baseUrl}/fault_reason/_listValid`, { params });
};

export function addFaultCause(data) {
  return request.post(`${baseUrl}/fault_reason/_add`, data);
}

export function updateFaultCause(data) {
  return request.post(`${baseUrl}/fault_reason/_update/${data.id}`, data);
}

export function disableFaultCause(id) {
  return request.post(`${baseUrl}/fault_reason/_disable/${id}`);
}

export function enableFaultCause(id) {
  return request.post(`${baseUrl}/fault_reason/_enable/${id}`);
}

export const getEquipmentCategoryList = async ({ page, size, ...rest }) => {
  return request.get(`${baseUrl}/equipment_category/_list`, {
    params: { page: page || defaultPage, size: size || defaultSize, ...rest },
  });
};

// 设备类型
export async function queryEquipmentCategoryList({ page, size, ...params }) {
  return request.get(`${baseUrl}/equipment_category/_list`, {
    params: { page: page || defaultPage, size: size || defaultSize, ...params },
  });
}

export async function queryEquipmentCategoryDetail(id) {
  return request.get(`${baseUrl}/equipment_category/_detail/${id}`);
}

export async function addEquipmentCategory(params) {
  return request.post(`${baseUrl}/equipment_category/_add`, { ...params });
}

export async function updateEquipmentCategory(id, params) {
  return request.post(`${baseUrl}/equipment_category/_update/${id}`, { ...params });
}

export async function deleteEquipmentCategory(id) {
  return request.post(`${baseUrl}/equipment_category/_delete/${id}`);
}

// 报告模板
export async function addReportTemplate(params) {
  return request.post(`${baseUrl}/report_template/_add`, { ...params });
}

export async function queryReportTemplateList({ page, size }) {
  return request.get(`${baseUrl}/report_template/_list`, {
    params: { page: page || defaultPage, size: size || defaultSize },
  });
}

export async function queryReportTemplateDetail(id) {
  return request.get(`${baseUrl}/report_template/_detail/${id}`);
}

export async function updateReportTemplate(id, params) {
  return request.post(`${baseUrl}/report_template/_update/${id}`, { ...params });
}

export async function deleteReportTemplate(id) {
  return request.post(`${baseUrl}/report_template/_delete/${id}`);
}

// 模具类型
export async function queryMoldCategoryList({ page, size, ...params }) {
  return request.get(`${baseUrl}/mould_category/_list`, {
    params: { page: page || defaultPage, size: size || defaultSize, ...params },
  });
}

export async function queryMoldCategoryDetail(id) {
  return request.get(`${baseUrl}/mould_category/_detail/${id}`);
}

export async function addMoldCategory(params) {
  return request.post(`${baseUrl}/mould_category/_add`, { ...params });
}

export async function updateMoldCategory(id, params) {
  return request.post(`${baseUrl}/mould_category/_update/${id}`, { ...params });
}

export async function deleteMoldCategory(id) {
  return request.post(`${baseUrl}/mould_category/_delete/${id}`);
}

// 设备制造商
export async function queryEquipmentManufacturerList({ page, size }) {
  return request.get(`${baseUrl}/equipment_manufacturer/_list`, {
    params: { page: page || defaultPage, size: size || defaultSize },
  });
}

export async function queryEquipmentManufacturerDetail(id) {
  return request.get(`${baseUrl}/equipment_manufacturer/_detail/${id}`);
}

export async function addEquipmentManufacturer(params) {
  return request.post(`${baseUrl}/equipment_manufacturer/_add`, { ...params });
}

export async function updateEquipmentManufacturer(id, params) {
  return request.post(`${baseUrl}/equipment_manufacturer/_update/${id}`, { ...params });
}

export async function deleteEquipmentManufacturer(id) {
  return request.post(`${baseUrl}/equipment_manufacturer/_delete/${id}`);
}

// 工装备件类定义
export async function getMachiningMaterial(params) {
  const { page, size, code, ...rest } = params;
  return request.get(`${baseUrl}/machining_material/_list`, {
    params: { page: page || defaultPage, size: size || defaultSize, code: encodeURIComponent(code), ...rest },
  });
}

export async function addMachiningMaterial(params) {
  return request.post(`${baseUrl}/machining_material/_add`, { ...params });
}

export async function editMachiningMaterial(code, params) {
  return request.post(`${baseUrl}/machining_material/_update?code=${encodeURIComponent(code)}`, { ...params });
}

export async function enableMachiningMaterial(code) {
  return request.post(`${baseUrl}/machining_material/_enable?code=${encodeURIComponent(code)}`);
}

export async function disableMachiningMaterial(code) {
  return request.post(`${baseUrl}/machining_material/_disable?code=${encodeURIComponent(code)}`);
}

export async function getMachiningMaterialDetail(code) {
  return request.get(`${baseUrl}/machining_material/_detail?code=${encodeURIComponent(code)}`);
}

export async function importMachiningMaterial(params) {
  return request.post(`${baseUrl}/machining_material/_import`, { ...params });
}

export async function importUpdateMachiningMaterial(params) {
  return request.post(`${baseUrl}/machining_material/_importUpdate`, { ...params });
}

export async function getMachiningMaterialImportHistory({ page, size, ...rest }) {
  return request.get(`${baseUrl}/machining_material/_importHistory`, {
    params: { page: page || defaultPage, size: size || defaultSize, ...rest },
  });
}

export async function getMachiningMaterialImportDetail(importId) {
  return request.get(`${baseUrl}/machining_material/_importHistory/${importId}`);
}

export default 'dummy';
