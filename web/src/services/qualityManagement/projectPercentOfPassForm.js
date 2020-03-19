import request from 'utils/request';

const baseUrl = 'datagram/v1';

export const getProjectPercentOfPassList = params =>
  request.get(`${baseUrl}/date_sync_produce_qc_records/_qualified_rate`, { params });

export const getProjectThroughRateList = params =>
  request.get(`${baseUrl}/date_sync_produce_qc_records/_through_rate`, { params });

export const getProduceQcRecord = params => request.post(`${baseUrl}/date_sync_produce_qc_records/items`, params);

export const getProduceQcRecordExport = (params, data) =>
  request.post(`${baseUrl}/date_sync_produce_qc_records/_list_for_export`, data, { params });

export default getProjectPercentOfPassList;
