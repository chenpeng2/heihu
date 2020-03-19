import request from 'utils/request';

const baseURL = 'ab_shipment/v1';

const categoryBase = `${baseURL}/io_categories/input_factory`;
const checkBase = `${baseURL}/check_configs/input_factory`;
const sortBase = `${baseURL}/sorting_plans/input_factory`;

export const getReceiptCategory = params => request.get(`${categoryBase}`, { params });

export const getReceiptCategoryDetail = id => request.get(`${categoryBase}/${id}`);

export const createReceiptCategory = data => request.post(`${categoryBase}`, data);

export const editReceiptCategory = (id, data) => request.put(`${categoryBase}/${id}`, data);

export const getReceiptChecks = params => request.get(`${checkBase}`, { params });

export const getReceiptCheck = id => request.get(`${checkBase}/${id}`);

export const createReceiptCheck = data => request.post(`${checkBase}`, data);

export const editReceiptCheck = (id, data) => request.put(`${checkBase}/${id}`, data);

export const toggleReceiptCheckStatus = (id, status) =>
  request.put(`${checkBase}/${id}/status`, { status });

export const getCheckHistory = (id) => request.get(`${baseURL}/check_config_operation_logs/configs/${id}`);

export const getSortPlan = (id) => request.get(`${sortBase}/${id}`);

export const getSortPlans = (params) => request.get(`${sortBase}`, { params });

export const createSortPlan = data => request.post(`${sortBase}`, data);

export const editSortPlan = (id, data) => request.put(`${sortBase}/${id}`, data);

export default getReceiptCategory;
