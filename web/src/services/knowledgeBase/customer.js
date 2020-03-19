import request from 'utils/request';

const base = 'order/v1';

export const getCustomers = params =>
  request.get(`${base}/customer`, { params });

export const createCustomer = data =>
  request.post(`${base}/customer`, data);

export const editCustomer = (id, data) =>
  request.put(`${base}/customer/${id}`, data);

export default getCustomers;
