import request from 'utils/request';

const baseURL = 'datagram/v1/input_factory_qc_records';

export const getInputFactoryQCRecordsList = ({ page = 1, size = 10, ...data }) =>
  request.post(`${baseURL}/materials`, data, { params: { page, size } });

export const getInputFactoryQCGraph = ({ page = 1, size = 10, ...data }) =>
  request.post(`${baseURL}/graph`, data, { params: { page, size } });

export default getInputFactoryQCRecordsList;
