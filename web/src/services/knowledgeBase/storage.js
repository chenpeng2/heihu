import request from 'utils/request';

const base = 'def/v1/storage';

export const getStorageList = params => request.get(`${base}`, { params });

export const getStorageListByLevel = params => request.get(`${base}/${params.parentCode}/storage`, { params });

export const getStorage = code => request.get(`${base}/${code}`);

export const createStorage = data => request.post(`${base}`, data);

export const editStorage = params => {
  const { code, updateStorageRequestDTO } = params;
  return request.put(`${base}/${code}`, updateStorageRequestDTO);
};

export const disabledStorage = (code, params) => request.put(`${base}/${code}/_disable`, params);

export const enabledStorage = (code, params) => request.put(`${base}/${code}/_enable`, params);

export const getStorageLog = (code, params) =>
  request.get(`${base}/${code}/log`, {
    params: { ...params, page: params.page || 1 },
  });

export const getStorageChildren = code => request.get(`${base}/${code}/all`);

// 导入仓位
export const importStorage = params => {
  return request.post(`${base}/_import`, params);
};

// 导入记录
export const importLogs = params => {
  return request.get(`${base}/import/files`, { params });
};

// 导入记录详情
export const importLogDetail = params => {
  return request.get(`${base}/import/files/failItems`, { params });
};

// 一级仓位，二级仓位导出
export const exportStorages = params => {
  return request.get(`${base}/list_storage`, { params });
};

export const getStorageQcItems = params => {
  return request.get(`${base}/_get_qc_items`, { params });
};

export default 'dummy';
