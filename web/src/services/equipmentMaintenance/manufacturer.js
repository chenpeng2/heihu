import request from 'utils/request';

const baseUrl = 'equipment/v1';

export function getManufacturer(params) {
  return request(`${baseUrl}/equipment_manufacturer/_list`, { params });
}

export default getManufacturer;
