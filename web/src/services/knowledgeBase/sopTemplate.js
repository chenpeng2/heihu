import request from 'utils/request';

const base = 'sopdef/v1';
const sopTaskBase = 'sopexe/v1';
const sopTemplate = `${base}/sop_template`;

export const sopTemplateList = params => request.get(`${sopTemplate}/_list`, { params });

export const enableSopTemplate = id => request.post(`${sopTemplate}/_enable?id=${id}`);

export const disableSopTemplate = id => request.post(`${sopTemplate}/_disable?id=${id}`);

export const createSopTemplate = data => request.post(`${sopTemplate}/_add`, data);

export const editSopTemplate = (id, data) => request.post(`${sopTemplate}/_update?id=${id}`, data);

export const getSOPTemplateDetail = id => request.get(`${sopTemplate}/_base_info`, { params: { id } });

export const getSOPTemplateList = id => request.get(`${sopTemplate}/_step_list?sopTemplateId=${id}`);

export const getProcessListForSOPTemplate = params => request.get(`${sopTemplate}/_process_list`, { params });

export const getSOPTemplateSteps = id => request.get(`${sopTemplate}/_step_list?sopTemplateId=${id}`);

export const createSOPTemplateStepGroup = (params, data) =>
  request.post(`${sopTemplate}/_add_step_group`, data, { params });

export const deleteSOPTemplateStep = params => request.post(`${sopTemplate}/_delete_step`, {}, { params });

export const getSOPTemplateStepDetail = (id, sopTemplateId) =>
  request.get(`${sopTemplate}/_step_info`, {
    params: {
      id,
      sopTemplateId,
    },
  });

export const createSOPTemplateStep = (params, data) => request.post(`${sopTemplate}/_add_step`, data, { params });

export const updateSOPTemplateStep = (id, data, sopTemplateId) =>
  request.post(`${sopTemplate}/_update_step`, data, { params: { id, sopTemplateId } });

export const copSOPTemplateStep = (id, sopTemplateId) =>
  request.post(
    `${sopTemplate}/_copy_step`,
    {},
    {
      params: { id, sopTemplateId },
    },
  );

export const updateStepTemplateOrder = (sopTemplateId, stepNodeVersion, data) =>
  request.post(`${sopTemplate}/_update_step_order`, data, {
    params: {
      sopTemplateId,
      stepNodeVersion,
    },
  });

export const updateSOPTemplateStepGroup = (id, data, sopTemplateId) =>
  request.post(`${sopTemplate}/_update_step_group`, data, {
    params: {
      id,
      sopTemplateId,
    },
  });

export const batchCreateSop = (sopTemplateId, data) =>
  request.post(`${sopTemplate}/_bulk_create_sop?sopTemplateId=${sopTemplateId}`, data);

export const getSOPTemplateLog = params => request.get(`${sopTemplate}/_list_operator_log`, { params });

export const addSOPTemplateCustomField = (id, data) =>
  request.post(`${sopTemplate}/_add_custom_field?sopTemplateId=${id}`, data);

export const copySopTemplateStepTo = (params, data) => request.post(`${sopTemplate}/_copy_step_to`, data, { params });

export default sopTemplateList;
