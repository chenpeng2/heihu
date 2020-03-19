import request from '../../utils/request';

const defaultSize = 10;
const defaultPage = 1;
const baseUrl = 'manufacture/v2/inventory';

export async function queryDeliverRecordList(params) {
  return request.get(`${baseUrl}/_listDeliverRecord`, {
    params: {
      page: params.page || defaultPage,
      size: params.size || defaultSize,
      ...params,
    },
  });
}

export default 'dummy';
