import request from '../../utils/request';

const defaultSize = 10;

export async function queryProcessOperation({ code, page, size, fromAt, toAt }) {
  return request.get(`def/v1/process_operation_log/${code}`, {
      params: { page: page || 1, size: size || defaultSize, fromAt, toAt },
  });
}

export async function mutateProcessStatus({ code, status }) {
  return request.put(`def/v1/process/${code}/status`, {
    status,
  });
}
export default 'dummy';
