// 异常事件的基础数据

import request from 'src/utils/request';

// 类型定义
const baseUrlForType = 'event/v1/event_categories';

export const getTypeList = async (params) => {
  return await request.get(`${baseUrlForType}`, { params });
};

export const createType = async (params) => {
  return await request.post(`${baseUrlForType}`, params);
};

export const editType = async (id, params) => {
  return await request.put(`${baseUrlForType}/${id}`, params);
};

export const getTypeDetail = async (id) => {
  return await request.get(`${baseUrlForType}/${id}`);
};

export const deleteType = async (id) => {
  return await request.delete(`${baseUrlForType}/${id}`);
};


// 处理标签
const baseUrlForLabel = 'event/v1/event_handle_labels';

export const getLabelList = async (params) => {
  return await request.get(`${baseUrlForLabel}`, { params });
};

export const createLabel = async (params) => {
  return await request.post(`${baseUrlForLabel}`, params);
};

export const editLabel = async (id, params) => {
  return await request.put(`${baseUrlForLabel}/${id}`, params);
};

export const getLabelDetail = async (id) => {
  return await request.get(`${baseUrlForLabel}/${id}`);
};

export const deleteLabel = async (id) => {
  return await request.delete(`${baseUrlForLabel}/${id}`);
};

// 异常主题
const baseUrlForSubject = 'event/v1/event_topics';

export const getSubjectList = async (params) => {
  return await request.get(`${baseUrlForSubject}`, { params });
};

export const createSubject = async (params) => {
  return await request.post(`${baseUrlForSubject}`, params);
};

export const editSubject = async (id, params) => {
  return await request.put(`${baseUrlForSubject}/${id}`, params);
};

export const updateSubjectStatus = async (id, params) => {
  return await request.put(`${baseUrlForSubject}/${id}/status`, params);
};

export const getSubjectDetail = async (id) => {
  return await request.get(`${baseUrlForSubject}/${id}`);
};

export const deleteSubject = async (id) => {
  return await request.delete(`${baseUrlForSubject}/${id}`);
};

// 订阅管理
const baseUrlForSetting = 'event/v1/event_settings';

export const getSetting = async (params) => {
  return await request.get(`${baseUrlForSetting}`, { params });
};

export const createSetting = async (params) => {
  return await request.post(`${baseUrlForSetting}`, params);
};

export const editSetting = async (id, params) => {
  return await request.put(`${baseUrlForSetting}/${id}`, params);
};

export const getSettingDetail = async (id) => {
  return await request.get(`${baseUrlForSetting}/${id}`);
};

export const deleteSetting = async (id) => {
  return await request.delete(`${baseUrlForSetting}/${id}`);
};


export default 'dummy';
