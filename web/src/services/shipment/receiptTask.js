import request from 'utils/request';

const baseURL = 'ab_shipment/v1/receive_task';

export function getReceiveTaskList(params) {
  return request.get(`${baseURL}/_list_for_web`, { params });
}

export const getReceiveTaskDetail = id => request.get(`${baseURL}/${id}/_detail`);

export const getEditReceiveTaskDetail = id => request.get(`${baseURL}/${id}/_detail_simple`);

export const editReceiveTask = (id, data) => request.post(`${baseURL}/${id}/_update`, data);

export const modifyReceiveTaskMaterial = (id, params) =>
  request.post(`${baseURL}/${id}/_receive_material_by_web`, {}, { params });

export const modifyReceiveTaskPackageMaterial = (id, params) =>
  request.post(`${baseURL}/${id}/_receive_package_material_by_web`, {}, { params });

export const getReceiveMaterialRecords = params =>
  request.get(`${baseURL}/_list_receive_material_records`, { params });

export const getReceiveDamageRecords = params =>
  request.get(`${baseURL}/_list_material_damage_records`, { params });

export const getReceiptCheckListDetail = (taskId, checkId) =>
  request.get(`${baseURL}/${taskId}/${checkId}/_checklist_detail`);

export function createReceiveTask(data) {
  return request.post(`${baseURL}/_create`, data);
}

export const getReceiptTaskStatus = () => request.get(`${baseURL}/_step_list`);

export default getReceiveTaskList;
