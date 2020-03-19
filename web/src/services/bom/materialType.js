import request from '../../utils/request';

const baseUrl = 'def/v1';

// 获取物料类型列表
export const queryMaterialList = params => {
  return request.get(`${baseUrl}/material_type`, { params });
};

// 获取物料类型列表
export const queryMaterialTypeList = params => {
  return request.get(`${baseUrl}/material_type`, { params });
};

// 创建物料类型
export const createMaterialType = params => {
  return request.post(`${baseUrl}/material_type`, params);
};

// 获取物料类型的详情
export const getMaterialTypeDetail = id => {
  return request.get(`${baseUrl}/material_type/${id}`);
};

// 更新物料类型
export const updateMaterialType = params => {
  const { id } = params;
  return request.put(`${baseUrl}/material_type/${id}`, params);
};

// 物料类型关联多个物料
export const relateMaterials = params => {
  return request.post(`${baseUrl}/material_type_relation/_bulk`, params);
};

// 更新物料类型状态
export const updateMaterialTypeStatus = (id, status) => {
  return request.put(`${baseUrl}/material_type/status/${id}`, { status });
};

export default 'dummy';
