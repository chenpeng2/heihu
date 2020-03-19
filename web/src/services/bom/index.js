import request from '../../utils/request';

const baseUrl = 'def/v1';

export function getProcessRoutings(params) {
  return request.get(`${baseUrl}/process_routing`, {
    params,
  });
}

export default request;
