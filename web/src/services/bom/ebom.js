import request from '../../utils/request';

const baseUrl = 'def/v1';

export async function queryEbomLogs(params) {
  return request.get(`${baseUrl}/ebomLog`, {
    params,
  });
}

export async function queryEbomLog({ id }) {
  return request.get(`${baseUrl}/ebomDetailLog/${id}`, {});
}
export async function queryEbomOperation({ id, ...params }) {
  return request.get(`${baseUrl}/ebomOperationLog/${id}`, {
    params,
    loadingKey: 'ebomOperation',
  });
}

export async function importEbom({ importId, eboms }) {
  return request.post(`${baseUrl}/ebom/_bulk`, {
    importId,
    eboms,
  });
}

export const getEbomList = async params => {
  return request.get(`${baseUrl}/ebom`, { params });
};

export const getEbomListWithExactSearch = async params => {
  return request.get(`${baseUrl}/ebom/material`, { params });
};

export const getEbomDetail = async id => {
  return request.get(`${baseUrl}/ebom/get_for_web/${id}`);
};

export const getEbomDetailForTree = (id, params) => request.get(`${baseUrl}/ebom/get_for_web_new/${id}`, { params });

export function updateEbom(id, data) {
  return request.put(`${baseUrl}/ebom/${id}`, data);
}

export function addEbom(data) {
  return request.post(`${baseUrl}/ebom`, data);
}

export function getMbomByEbom(id) {
  return request.get(`${baseUrl}/mbom/ebom/${id}`);
}

export function stopMbomByEbom(id) {
  return request.put(`${baseUrl}/mbom/stop_by_ebom/${id}`);
}

export function modifyEbomStatus(id, data) {
  return request.put(`${baseUrl}/ebom/${id}/status`, data);
}

export function enableMaterialByEbom(id) {
  return request.put(`${baseUrl}/ebom/${id}/enable_material`);
}

// 根据物料code和ebom版本号来查找ebom
export const getEbomByMaterialCodeAndVersion = async ({ code, version }) => {
  return request.get(`${baseUrl}/ebom/material_version`, {
    params: { code, version },
  });
};

// 用ebomId获取相关的ebom和mbom
export const getEbomAndMbomByEbomIds = async params => {
  return request.get(`${baseUrl}/ebom/_list_ebom_mbom`, { params });
};

// 改变ebom和mbom的版本号
export const replaceEbomMaterial = async params => {
  return request.put(`${baseUrl}/ebom/async_job/edit_material_code`, params);
};

// 获取ebom的数据
export const getEbomListForUpdateMaterial = async params => {
  return request.get(`${baseUrl}/ebom/raw_material_code`, { params });
};

// 批量启用停用ebom
export const ebomBulkUpdateStatus = params => {
  return request.put(`${baseUrl}/ebom/_bulk/status`, params);
};

export default request;
