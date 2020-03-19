import request from 'utils/request';

const base = 'scheduling/v1';

export const getCapacityConstraints = params => request.get(`${base}/capacity_constraint`, { params });

export const createCapacityConstraint = data => request.post(`${base}/capacity_constraint`, data);

export const updateCapacityConstraint = (id, data) => request.patch(`${base}/capacity_constraint/${id}`, data);

export const getCapacityConstraintDetail = id => request.get(`${base}/capacity_constraint/${id}`);

export default 'dummy';
