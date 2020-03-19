import request from '../../utils/request';

const defaultSize = 10;
const baseUrl = 'manufacture/v1';

export async function queryProdTaskList(variables) {
  return request.get(`${baseUrl}/project/produce_task/list`, {
    params: { ...variables, page: variables.page || 1, size: variables.size || defaultSize },
  });
}

export async function queryProdTaskListByProjectCodes(body, query) {
  return request.post(`${baseUrl}/project/produce_task/task_project_process/bulk`, body, {
    params: { ...query, page: query.page || 1, size: query.size || defaultSize },
  });
}

export async function queryProdTaskReportsList(params) {
  return request.get('datagram/v1/project_progress/task_report', {
    params: { ...params },
  });
}

export async function queryProdTaskSchedule(params) {
  return request.get(`${baseUrl}/project/produce_task/schedule/task`, {
    params: { ...params },
  });
}

export async function queryProdTaskStartTime(params) {
  return request.get(`${baseUrl}/project/produce_task/schedule/startTimePlanned`, {
    params: { ...params },
  });
}

export async function queryProdTaskListByWorkstations(params) {
  return request.get(`${baseUrl}/project/produce_task/byWorkstations`, {
    params,
  });
}

export async function queryProdTaskDetail({ taskId }) {
  return request.get(`${baseUrl}/project/produce_task/${taskId}/detail`, {
    params: { taskId },
  });
}

export async function queryProdUseRecords(taskId, params) {
  return request.get(`${baseUrl}/project/produce_task/${taskId}/useRecords`, {
    params: { id: taskId, ...params },
  });
}

export async function queryUnqualifiedRawMaterialRecords(taskId, params) {
  return request.get(`${baseUrl}/project/produce_task/${taskId}/scanUnqualifiedRawMaterialRecords`, {
    params: { id: taskId, ...params },
  });
}

export async function queryManualUnqualifiedRawMaterialRecords(taskId, params) {
  return request.get(`${baseUrl}/project/produce_task/${taskId}/manualUnqualifiedRawMaterialRecords`, {
    params: { id: taskId, ...params },
  });
}

export async function queryProdHoldRecords(taskId, params) {
  return request.get(`${baseUrl}/project/produce_task/${taskId}/holdRecords`, {
    params: { id: taskId, ...params },
  });
}

export async function queryUnqualifiedProdHoldRecords(taskId, params) {
  return request.get(`${baseUrl}/project/produce_task/${taskId}/scanUnqualifiedHoldRecords`, {
    params: { id: taskId, ...params },
  });
}

export async function queryManualUnqualifiedProdHoldRecords(taskId, params) {
  return request.get(`${baseUrl}/project/produce_task/${taskId}/manualUnqualifiedHoldRecords`, {
    params: { id: taskId, ...params },
  });
}

// 回撤记录
export async function queryRetreatUseRecords(taskId, params) {
  return request.get(`${baseUrl}/project/produce_task/${taskId}/new/retreatUseRecords`, {
    params,
  });
}

// 副产出产出记录
export async function queryByProductRecords(taskId, params) {
  return request.get(
    `${baseUrl}/project/produce_task/${taskId}/hold/${encodeURIComponent(params.materialCode)}/byproduct/holdRecords`,
    {
      params,
    },
  );
}

// 副产出不合格记录
export async function queryScanUnqualifiedByProductMaterialRecords(taskId, params) {
  return request.get(
    `${baseUrl}/project/produce_task/${taskId}/hold/${encodeURIComponent(
      params.materialCode,
    )}/byproduct/unqualifiedRecords`,
    {
      params,
    },
  );
}

export async function queryHoldRecordDetail(id) {
  return request.get(`${baseUrl}/scanRecord/hold/${id}/detail`, {
    params: { id },
  });
}

export async function queryUseRecordDetail(id) {
  return request.get(`${baseUrl}/scanRecord/use/${id}/detail`, {
    params: { id },
  });
}

export async function queryScanUnqualifiedHoldRecordDetail(id) {
  return request.get(`${baseUrl}/scanRecord/scanUnqualifiedHoldRecord/${id}/detail`, {
    params: { id },
  });
}

export async function queryScanUnqualifiedRawMaterialRecordDetail(id) {
  return request.get(`${baseUrl}/scanRecord/scanUnqualifiedRawMaterialRecord/${id}/detail`, {
    params: { id },
  });
}

export async function queryScanByProductUnqualifiedOutput(id) {
  return request.get(`${baseUrl}/scanRecord/unqualified/byProduct/${id}/detail`, {
    params: { id },
  });
}

export async function queryScanByProductOutput(id) {
  return request.get(`${baseUrl}/scanRecord/hold/byProduct/${id}/detail`, {
    params: { id },
  });
}

export async function queryProdTaskOperationLog({ taskId, ...params }) {
  return request.get(`${baseUrl}/project/task_history/list/${taskId}`, {
    params: { ...params },
  });
}

export async function queryQrcodeDetail({ id }) {
  return request.get(`${baseUrl}/materialLot/detailForWebById/${id}`, {
    params: { id },
  });
}

export async function cancelProduceTask({ id }) {
  return request.put(`${baseUrl}/project/produce_task/${id}/status/5`, { id, status: 5 });
}

export const baitingProdTask = ({ taskId }) => request.get(`${baseUrl}/project/produce_task/cutting/_detail/${taskId}`);

// export async function queryProcess
export const queryUseRecord = id =>
  request.get(`${baseUrl}/materialLot/${id}/useRecords`, { params: { page: 1, size: 1000 } });

export const setMultiBulkPriority = data => {
  return request.post(`${baseUrl}/project/produce_task/_bulk_set_prior`, data);
};

export default 'dummy';
