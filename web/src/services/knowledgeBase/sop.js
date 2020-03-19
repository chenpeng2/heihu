import request from 'utils/request';

const base = 'sopdef/v1';
const sopTaskBase = 'sopexe/v1';

export const getSOPList = params => request.get(`${base}/sop/_list`, { params });

export const createSOP = data => request.post(`${base}/sop/_add`, data);

export const editSOP = (id, data) => request.post(`${base}/sop/_update?id=${id}`, data);

export const getSOPDetail = id => request.get(`${base}/sop/_base_info?id=${id}`);

export const getSOPSteps = id => request.get(`${base}/sop/_step_list?sopId=${id}`);

export const getSOPPresetFields = businessObjectType =>
  request.get(`${base}/sop/_preset_fields`, {
    params: {
      businessObjectType,
    },
  });

export const createSOPStepGroup = (params, data) => request.post(`${base}/sop/_add_step_group`, data, { params });

export const createSOPStep = (params, data) => request.post(`${base}/sop/_add_step`, data, { params });

export const updateSOPStep = (id, data) => request.post(`${base}/sop/_update_step`, data, { params: { id } });

export const updateSOPStepFromTemplate = (id, data, sopId) =>
  request.post(`${base}/sop/_update_sop_from_template`, data, { params: { id, sopId } });

export const updateSOPStepGroup = (id, data) => request.post(`${base}/sop/_update_step_group?id=${id}`, data);

export const deleteSOPStep = params => request.post(`${base}/sop/_delete_step`, {}, { params });

export const getSOPStepDetail = (id, sopId) =>
  request.get(`${base}/sop/_step_info`, {
    params: {
      id,
      sopId,
    },
  });

export const disableSOP = id => request.post(`${base}/sop/_disable?id=${id}`);

export const enableSOP = id => request.post(`${base}/sop/_enable?id=${id}`);

export const addCustomField = (id, data) => request.post(`${base}/sop/_add_custom_field?sopId=${id}`, data);

export const copySopStep = id => request.post(`${base}/sop/_copy_step?id=${id}`);

export const copySopStepTo = (params, data) => request.post(`${base}/sop/_copy_step_to`, data, { params });

export const copySop = (id, code) => request.post(`${base}/sop/_copy_sop`, {}, { params: { id, code } });

export const getSOPLog = params => request.get(`${base}/sop/_list_operator_log`, { params });

export const updateStepOrder = (sopId, stepNodeVersion, data) =>
  request.post(`${base}/sop/_update_step_order`, data, {
    params: {
      sopId,
      stepNodeVersion,
    },
  });

export const getSOPTaskList = params => request.get(`${sopTaskBase}/soptask/performance/_search_for_web`, { params });

export const getSOPTaskDetail = id => request.get(`${sopTaskBase}/soptask/performance/_get_for_web?taskId=${id}`);

export const getSOPTaskHistory = params => request.get(`${sopTaskBase}/soptask/history`, { params });

export const getSOPProjectProcesses = params =>
  request.get(`${sopTaskBase}/soptask/performance/project_processes`, { params });

export const getSOPTaskRecordResult = params =>
  request.get(`${sopTaskBase}/soptask/performance/_step_record_list`, { params });

export const batchEnableSOP = ids => request.post(`${base}/sop/_bulk_enable`, ids);

export const batchDisableSOP = ids => request.post(`${base}/sop/_bulk_disable`, ids);

// 更新根据SOP模板创建的sop对应的字段
export const updateSopFieldFromTemplate = (sopId, data) =>
  request.post(`${base}/sop/_update_sop_field_from_template?sopId=${sopId}`, data);

export default getSOPList;
