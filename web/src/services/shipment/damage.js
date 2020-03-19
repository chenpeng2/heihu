import request from 'utils/request';

const baseURL = 'ab_shipment/v1';

const reasonBase = `${baseURL}/damage_reasons`;

export const getReceiptDamageReason = (params) => request.get(`${reasonBase}/input_factory`, { params });

export const createReceiptDamageReason = (data) => request.post(`${reasonBase}/input_factory`, data);

export const editReceiptDamageReason = (id, data) => request.put(`${reasonBase}/input_factory/${id}`, data);

export const getSendDamageReason = (params) => request.get(`${reasonBase}/output_factory`, { params });

export const createSendDamageReason = (data) => request.post(`${reasonBase}/output_factory`, data);

export const editSendDamageReason = (id, data) => request.put(`${reasonBase}/output_factory/${id}`, data);

export default getReceiptDamageReason;
