import request from 'utils/request';

const baseURL = 'datagram/v1';

export const getReceiveMaterialDatagram = (data, params) =>
  request.post(`${baseURL}/date_sync_receive_material_record/_list`, data, { params });

export const getSortingStatisticsDatagram = params =>
  request.get(`${baseURL}/sorting_statistics_records`, { params });

export default getReceiveMaterialDatagram;
