import request from 'utils/request';

const defaultSize = 10;
const defaultPage = 1;
const baseUrl = '/history_trace/v1/record';

export function queryDeliverTraceFields() {
  return request.get(`${baseUrl}/all_fields`);
}

export function queryDeliverTrace({ conditions, page, size }) {
  return request.post(`${baseUrl}/search`, {
    conditions: conditions || '',
    page: page || defaultPage,
    size: size || defaultSize,
  });
}

export function queryDeliverTraceSelectRange({ field_name, pre_value }) {
  return request.get(`${baseUrl}/select_range`, {
    params: {
      field_name,
      pre_value,
    },
  });
}

export default 'dummy';
