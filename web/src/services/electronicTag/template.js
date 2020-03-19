import request from '../../utils/request';

const baseUrl = 'def/v1';

export const getPrintTagTemplates = async params => {
  return await request.get(`${baseUrl}/print_template/list`, { params });
};

export const createPrintTagTemplate = async data => {
  return await request.post(`${baseUrl}/print_template`, data);
};

export const updatePrintTagTemplate = async data => {
  return await request.post(`${baseUrl}/print_template/update`, data);
};

// 获取业务类型列表和对应的模版数量
export const getBusinessList = async params => {
  return await request.get(`${baseUrl}/print_template/summary`, { params });
};

// 获取业务类型下的文件
export const getBusinessFiles = async type => {
  return await request.get(`${baseUrl}/print_template/list/type?type=${encodeURIComponent(type)}`);
};

// 删除业务类型下的文件
export const deleteTemplate = async templateId => {
  return await request.delete(`${baseUrl}/print_template/item?templateId=${encodeURIComponent(templateId)}`);
};

// 设置业务类型下的默认模版
export const setDefaultTemplate = async templateId => {
  return await request.patch(`${baseUrl}/print_template/item/default`, { templateId });
};

export default request;
