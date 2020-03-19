import request from '../../utils/request';

const baseUrl = 'manufacture/v1';

export async function getOutputMaterialInfo(projectCode) {
  return request.get(`${baseUrl}/project/produce_task/cuttingtask/statistic`, {
    params: { projectCode },
  });
}
