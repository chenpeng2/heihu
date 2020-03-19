import request from 'utils/request';

const baseUrl = 'datagram/v1/input_factory_qc_records';

export const getIncomingCheckItem = data => request.post(`${baseUrl}/incoming_check_items`, data);

export const getIncomingGraph = data => request.post(`${baseUrl}/incoming_graph`, data);

export const getIncomingMaterial = data => request.post(`${baseUrl}/incoming_materials`, data);

export default getIncomingCheckItem;
