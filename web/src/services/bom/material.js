import qs from 'qs';
import request from '../../utils/request';

const defaultSize = 10;
const defaultPage = 1;
const baseUrl = 'def/v1';

export async function queryMaterialList({ customFields, ...rest }) {
  const searchParams = qs.stringify(rest);
  return request.post(`${baseUrl}/material/list_for_web?${searchParams}`, customFields || []);
}

export async function queryMaterialDetail(code) {
  return request.get(`${baseUrl}/material/${encodeURIComponent(code)}`);
}

export async function updateMaterialStatus(code, data) {
  return request.put(`${baseUrl}/material/${encodeURIComponent(code)}/status`, data);
}

export async function addMaterial(data) {
  return request.post(`${baseUrl}/material`, data);
}

export async function importMaterials(data) {
  return request.post(`${baseUrl}/material/_bulk_for_web`, data);
}

export async function queryMaterialOperationLogs(code, { page, size, fromAt, toAt }) {
  return request.get(`${baseUrl}/materialOperationLog/${encodeURIComponent(code)}?`, {
    params: { page, size: size || defaultSize, fromAt, toAt },
  });
}

export async function queryMaterialImportLogs({ page, size, fromAt, toAt }) {
  return request.get(`${baseUrl}/materialLog?`, {
    params: { page: page || 1, size: size || defaultSize, fromAt, toAt },
  });
}

export async function queryMaterialImportDetail({ importId, page, size, fromAt, toAt }) {
  return request.get(`${baseUrl}/materialDetailLog/${importId}?`, {
    params: { page: page || 1, size: size || defaultSize, fromAt, toAt },
  });
}

export async function updateMaterial(code, data) {
  return request.put(`${baseUrl}/material/${encodeURIComponent(code)}`, data);
}

export async function queryUnits(p) {
  return request.get(`${baseUrl}/unit`, {
    params: { size: 1000, ...p },
  });
}

export async function queryMaterial({ codeLike, name, status, search, size }) {
  return request.get(`${baseUrl}/material`, {
    params: { codeLike, status, name, search, size },
  });
}

// 批量查询物料
export const getMaterialsDetail = materialCodes => {
  return request.post(`${baseUrl}/material/codes`, { materialCodes });
};

// 获取工厂的物料自定义字段
export const queryMaterialCustomField = () => {
  return request.get(`${baseUrl}/material_custom_field_config`);
};

// 更新工厂的自定义字段
export const updateMaterialCustomField = params => {
  return request.put(`${baseUrl}/material_custom_field_config`, params);
};

// 自动计算物料单位比例转换
export const convertUnit = params => {
  return request.post(`${baseUrl}/material_unit_conversion/convert_unit`, params);
};

export default request;
