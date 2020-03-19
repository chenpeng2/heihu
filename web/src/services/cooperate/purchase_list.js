// @flow
import qs from 'qs';
import request from '../../utils/request';

const baseUrl = 'order/v1';
const manufactureBaseUrl = 'manufacture/v1';
const url_list = {
  create_purchase_list: 'procure_order',
  purchase_list_list: 'procure_order/list',
  purchase_list_detail: 'procure_order/detail',
  purchase_list_history: 'procure_order_history/list',
  unique_code: 'procure_order/code',
  update_purchase_list: 'procure_order/update',
  update_purchase_list_state: 'procure_order/status',
  get_project_purchase_progress: 'procure_material/project_procure',
  operator: 'procure_order/default_operator',
};

export const create_purchase_list = async (procureOrderRequestDTO: {}): any => {
  return request.post(`${baseUrl}/${url_list.create_purchase_list}`, procureOrderRequestDTO);
};

export const get_purchase_list_list = async (params: {}): any => {
  return request.get(`${baseUrl}/${url_list.purchase_list_list}`, { params });
};

export const get_purchase_list_detail = async (id: number): any => {
  return request.get(`${baseUrl}/${url_list.purchase_list_detail}/${id}`);
};

export const get_procure_order_history = async (params: any): any => {
  return request.get(`${baseUrl}/${url_list.purchase_list_history}`, { params: { size: 10, ...params } });
};

export const get_purchase_list_unique_code = async (): any => {
  return request.get(`${baseUrl}/${url_list.unique_code}`);
};

export const get_purchase_list_operator = async (): any => {
  return request.get(`${baseUrl}/${url_list.operator}`);
};

export const update_purchase_list = async (params: any): any => {
  return request.put(`${baseUrl}/${url_list.update_purchase_list}`, params);
};

export const update_purchase_list_state = async (params: any): any => {
  return request.put(`${baseUrl}/${url_list.update_purchase_list_state}`, params);
};

export const bulkUpdatePurchaseListState = async (params: any): any => {
  return request.put(`${baseUrl}/procure_order/bulk_status`, params);
};

export const importPurchaseList = async (params: any): any => {
  return request.post(`${baseUrl}/procure_order/import`, params);
};

export const purchaseListImportHistory = async (params: any): any => {
  return request.get(`${baseUrl}/procure_order/import/list`, { params });
};

export const purchaseListImportDetail = async (params: any): any => {
  return request.get(`${baseUrl}/procure_order/import/detail/${params.importId}`);
};

/** 采购清单入厂 */
export const purchaseMaterialBulkIncoming = async (params: any): any => {
  return request.post(`${baseUrl}/procure_material/bulkInFactory`, params, { loading: true });
};

export const purchaseInFactoryRecord = async (params: any): any => {
  return request.get(`${baseUrl}/in_factory_record/list`, { params });
};

export const purchaseUpdatePrintCount = async (params: any): any => {
  return request.put(`${baseUrl}/in_factory_record/update/print_count`, params);
};

export const purchaseListBulkInfo = async params => {
  return request.post(`${baseUrl}/procure_order/printByCodes/bulk_info`, params);
};

/** 采购清单条件筛选 */
export const filterProcureOrderDetail = async ({ id, filter, ...params }) => {
  // const { id, ...rest } = params || {};
  // const query = qs.stringify(rest);
  return request.get(`${baseUrl}/procure_order/detail/${id}/condition`, {
    params: { ...filter, ...params },
    loading: true,
  });
};

export default 'dummy';
