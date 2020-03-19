import request from 'utils/request';

const BASE_URL = 'def/v1';

export function getDefects(params) {
  return request.get('def/v1/defect', { params });
}

export function addDefect(data) {
  return request.post('def/v1/defect', data);
}
export function getDefect(id) {
  return request.get(`def/v1/defect/${id}`);
}
export function editDefect(id, data) {
  return request.put(`def/v1/defect/${id}`, data);
}

// 导入次品项
export const importDefects = (params) => {
  return request.post(`${BASE_URL}/defect/_bulk`, params);
};

// 导入次品项日志详情
export const importDefectDetail = (importId, params) => {
  return request.get(`${BASE_URL}/defect_detail_log/${importId}`, { params });
};

// 导入次品项列表
export const importDefectsLog = (params) => {
    return request.get(`${BASE_URL}/defect_import_log`, { params });
};

// 获取次品项的自动生成编号
export const getCodeForDefect = () => {
  return request.post(`${BASE_URL}/defect/create_codes`);
};

// 更新次品分类的状态
export const updateDefectStatus = (id, status) => {
  return request.put(`${BASE_URL}/defect/${id}/status`, {}, { params: { status } });
};

// 获取次品分类列表
export const getDefectCategoryList = params => {
  return request.get(`${BASE_URL}/defect_group`, { params });
};

// 创建次品分类
export const createDefectCategory = params => {
  return request.post(`${BASE_URL}/defect_group`, params);
};

// 编辑次品分类
export const editDefectCategory = params => {
  const { id, ...rest } = params || {};
  return request.put(`${BASE_URL}/defect_group/${encodeURIComponent(id)}`, rest);
};

// 获取单个次品分类的详情
export const getDefectCategoryDetail = id => {
  return request.get(`${BASE_URL}/defect_group/${id}`);
};

// 更新次品分类的详情
export const updateDefectState = (id, nextState) => {
  return request.put(`${BASE_URL}/defect_group/${id}/status?status=${nextState}`);
};

export default getDefects;
