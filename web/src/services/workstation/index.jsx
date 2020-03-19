import request from '../../utils/request';

const defaultSize = 10;
const baseUrl = 'def/v1';
const locationUrl = 'location';

export async function queryWorkstation(params) {
  return request.get(`${baseUrl}/workstation`, {
    params,
  });
}

export async function queryWorkstationById(id) {
  return request.get(`${baseUrl}/workstation/${id}`);
}

export async function queryWorkstationItems(params, query) {
  return request.post(`${baseUrl}/workstation/items`, params, {
    params: query,
  });
}

export async function queryWorkstationGroup(params) {
  return request.get(`${baseUrl}/workstation_group`, {
    params: {
      ...params,
    },
  });
}

export async function queryDefWorkstations(params) {
  return request.get(`${baseUrl}/workstations`, {
    params: {
      ...params,
    },
  });
}

export async function queryWorkstations(params) {
  return request.get(`${locationUrl}/workstations`, {
    params: {
      ...params,
    },
  });
}

export async function queryWorkstationGroups(params) {
  return request.get(`${baseUrl}/workstation_groups`, {
    params: {
      ...params,
    },
  });
}

export async function createWorkstationGroup(params) {
  return request.post(`${baseUrl}/workstation_groups`, {
    ...params,
  });
}

export const getFeedingStorageByWorkstation = id => request.get(`${baseUrl}/workstations/${id}/feedingStorage`);

export const getBulkFeedingStorageByWorkstation = ids =>
  request.post(`${baseUrl}/workstations/feedingStorage/_bulk`, ids);

export default 'dummy';
