import request from 'utils/request';

const baseURL = 'ab_shipment/v1';

const sendBase = `${baseURL}/io_categories`;

const categoryBase = `${sendBase}/output_factory`;

const checkBase = `${baseURL}/check_configs/output_factory`;

export const getSendCategories = params => request.get(`${categoryBase}`, { params });

export const getSendCategoryDetail = id => request.get(`${categoryBase}/${id}`);

export const createSendCategory = data => request.post(`${categoryBase}`, data);

export const editSendCategory = (id, data) => request.put(`${categoryBase}/${id}`, data);

export const getSendChecks = params => request.get(`${checkBase}`, { params });

export const editSendCheck = (id, data) => request.put(`${checkBase}/${id}`, data);

export const createSendCheck = data => request.post(`${checkBase}`, data);

export const getSendCheck = id => request.get(`${checkBase}/${id}`);

export const toggleSendCheckStatus = (id, status) =>
  request.put(`${checkBase}/${id}/status`, { status });

export default getSendCategories;
