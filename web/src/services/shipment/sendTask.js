import request from 'utils/request';

const baseURL = 'ab_shipment/v1/shipping_task';

export const getSendTaskList = params => request.get(`${baseURL}/_list_for_web`, { params });

export const getSendDamageRecords = params => request.get(`${baseURL}/_list_material_damage_records`, { params });

export const getSendTaskDetail = id => request.get(`${baseURL}/${id}/_detail`);

export const createSendTaskDetail = data => request.post(`${baseURL}/_create`, data);

export const editSendTaskDetail = (id, data) => request.put(`${baseURL}/${id}/_update`, data);

export const getEditSendTaskDetail = id => request.get(`${baseURL}/${id}/_detail_simple`);

export const getSendMaterialRecords = params => request.get(`${baseURL}/_list_receive_material_records`, { params });

export const getSendCheckListDetail = (taskId, checkId) =>
  request.get(`${baseURL}/${taskId}/${checkId}/_checklist_detail`);

export const modifySendTaskMaterial = (id, params) =>
  request.post(`${baseURL}/${id}/_receive_material_by_web`, {}, { params });

export const modifySendTaskPackageMaterial = (id, params) =>
  request.post(`${baseURL}/${id}/_receive_package_material_by_web`, {}, { params });

export const getSendTaskStatus = () => request.get(`${baseURL}/_step_list`);

export const importSendTasks = data => request.post(`${baseURL}/_batchImport`, data);

export const getImportList = params => request.get(`${baseURL}/_batchImport_list`, { params });

export const getImportDetail = importId => request.get(`${baseURL}/_batchImport_detail/${importId}`);

export const getImportErrorList = (importId, params) =>
  request.get(`${baseURL}/_batchImport_error_list/${importId}`, { params });

export default getSendDamageRecords;
