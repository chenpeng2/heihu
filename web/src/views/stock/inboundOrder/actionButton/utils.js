export const getCreateInboundOrderUrl = () => '/stock/inboundOrder/create';

export const getInboundOrderListUrl = () => '/stock/inboundOrder/list';

export const getInboundOrderDetailUrl = (inboundOrderCode) => `/stock/inboundOrder/detail?inboundOrderCode=${inboundOrderCode}`;

export const getEditInboundOrderUrl = (inboundOrderCode) => `/stock/inboundOrder/edit?inboundOrderCode=${inboundOrderCode}`;

export default 'dummy';
