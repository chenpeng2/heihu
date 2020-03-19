import request from 'utils/request';

const base = 'def/v1';

export const addFeedingStorageByWorkshop = (workShopId, params) =>
  request.put(`${base}/workshops/${workShopId}/feedingStorageCodes`, params);

export const addFeedingStorageByProdline = (lineId, params) =>
  request.put(`${base}/productionLines/${lineId}/feedingStorageCodes`, params);

export const addFeedingStorageByWorkstation = (workstationId, params) =>
  request.put(`${base}/workstationAreas/${workstationId}/feedingStorageCodes`, params);

export const addFinishedStorageByWorkshop = (workShopId, code) =>
  request.put(`${base}/workshops/${workShopId}/finishedStorageCode/${code}`);

export const addFinishedStorageByProdline = (lineId, code) =>
  request.put(`${base}/productionLines/${lineId}/finishedStorageCode/${code}`);

export const addFinishedStorageByWorkstation = (workstationId, code) =>
  request.put(`${base}/workstationAreas/${workstationId}/finishedStorageCode/${code}`);

export const deleteFeedingStorageByWorkshop = params =>
  request.delete(`${base}/workshops/${params.id}/feedingStorageCodes/${params.code}`);

export const deleteFeedingStorageByProdline = params =>
  request.delete(`${base}/productionLines/${params.id}/feedingStorageCodes/${params.code}`);

export const deleteFeedingStorageByWorkstation = params =>
  request.delete(`${base}/workstationAreas/${params.id}/feedingStorageCodes/${params.code}`);

export const deleteFinishedStorageByWorkshop = params =>
  request.delete(`${base}/workshops/${params.id}/finishedStorageCode`);

export const deleteFinishedStorageByProdline = params =>
  request.delete(`${base}/productionLines/${params.id}/finishedStorageCode`);

export const deleteFinishedStorageByWorkstation = params =>
  request.delete(`${base}/workstationAreas/${params.id}/finishedStorageCode`);

export default 'dummy';
