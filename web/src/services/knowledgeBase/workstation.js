import request from 'utils/request';

const base = 'def/v1/workstationAreas';

export const getWorkstations = params => request.get(base, { params });
export const createWorkstation = data => request.post(base, data);
export const getWorkstation = id => request.get(`${base}/${id}`);
export const editWorkstation = (id, data) => request.patch(`${base}/${id}`, data);
export const getWorkstationParents = params => request.get(`${base}/parents`, { params });
export const checkDisabled = id => request.get(`${base}/${id}/disabled`);
export const disabledWorkstation = id => request.put(`${base}/${id}/disabled`);
export const checkEnabled = id => request.get(`${base}/${id}/enabled`);
export const enabledWorkstation = id => request.put(`${base}/${id}/enabled`);
export const getWorkstationLogs = (id, params) => request.get(`${base}/${id}/logs`, { params });
export const editWorkstationWorkers = (id, data) => request.put(`${base}/${id}/workers`, data);
export const importWorkstation = data => request.post('def/v1/workstations/_import', data);
export const importWorkstationLog = params =>
  request.get('def/v1/workstation_import_log', { params });
export const importWorkstationLogDetail = id => request.get(`def/v1/workstation_import_log/${id}`);
export const exportWorkstationLog = params =>
  request.get('def/v1/workstation_export_log', { params });
export const addExportWorkstationLog = () => request.get('def/v1/workstation_export_log/save');
export const deleteWorkstation = id => request.delete(`${base}/${id}`);

export default getWorkstation;
