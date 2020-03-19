import request from 'utils/request';

export function getProductOrders(params) {
  return request.get('/rest/productorder', {
    params,
  });
}

export function getProdTaskOperationLog(params) {
  return request.get('mbom_operation_log/?user=1', {
    params: {},
  });
}

export function getProjectProcess({ projectCode, processSeq }) {
  return request.get(`manufacture/v1/project_processes/${encodeURIComponent(projectCode)}/processes/${processSeq}`);
}

// 创建任务
export function createProduceTask(data) {
  return request.post('manufacture/v1/project/produce_task', data);
}

// 查询单个任务详情
export function produceTaskDetail(id) {
  return request.get(`manufacture/v1/project/produce_task/${id}/detail`);
}

// 更新任务
export function updateProduceTask(params) {
  return request.put('manufacture/v1/project/produce_task/update', {
    ...params,
  });
}

export default request;
